import supabase from './db-client.js';
import { requireRole, slugify, setCors, SALES_ROLES, CONTENT_ROLES, ADMIN_ROLES, audit } from './_auth.js';

const LIST_SELECT = '*, projects(id,name,locality,city,cover_image,rera_number,rera_status,status), developers(id,name)';
const DETAIL_SELECT = '*, projects(*), developers(*), property_images(*), property_amenities(amenities(*))';

const VALID_PROPERTY_COLUMNS = new Set([
  'title', 'slug', 'description', 'property_type', 'listing_type', 'status',
  'price', 'bedrooms', 'bathrooms', 'area_sqft', 'carpet_note', 'floor_no',
  'total_floors', 'facing', 'furnishing', 'parking', 'possession_date',
  'address', 'locality', 'city', 'project_id', 'developer_id', 'cover_image',
  'video_url', 'rera_approved', 'rera_number', 'featured', 'is_active', 'views',
]);

function cleanBody(body) {
  const b = {};
  if (!body || typeof body !== 'object') return b;
  for (const [key, value] of Object.entries(body)) {
    if (VALID_PROPERTY_COLUMNS.has(key)) {
      b[key] = value === '' ? null : value;
    }
  }
  return b;
}

const DEFAULT_PROJECTS = [
  { id: 1, name: 'Worli Sea Crest', locality: 'Worli', city: 'Mumbai', status: 'Ready to Move', slug: 'worli-sea-crest', cover_image: '/images/tower-a.jpg', description: 'Iconic sea-facing luxury towers in Worli.', price_min: 45000000, price_max: 120000000, featured: true },
  { id: 2, name: 'Hiranandani Oakwood', locality: 'Powai', city: 'Mumbai', status: 'Ready to Move', slug: 'hiranandani-oakwood', cover_image: '/images/tower-b.jpg', description: 'High-rise luxury living overlooking Powai Lake.', price_min: 32000000, price_max: 75000000, featured: true },
  { id: 3, name: 'Serenity Lakeside', locality: 'Thane West', city: 'Thane', status: 'Under Construction', slug: 'serenity-lakeside', cover_image: '/images/thane-lake.jpg', description: 'Lakeside township with premium lifestyle amenities.', price_min: 18000000, price_max: 42000000, featured: true },
  { id: 4, name: 'Sagar Vihar Waterfront', locality: 'Vashi', city: 'Navi Mumbai', status: 'Ready to Move', slug: 'sagar-vihar-waterfront', cover_image: '/images/hero-skyline.jpg', description: 'Waterfront luxury apartments in Sector 8, Vashi.', price_min: 22000000, price_max: 55000000 },
  { id: 5, name: 'Belapur Crest', locality: 'Belapur', city: 'Navi Mumbai', status: 'Under Construction', slug: 'belapur-crest', cover_image: '/images/tower-a.jpg', description: 'CBD Belapur premium commercial & residential towers.', price_min: 15000000, price_max: 38000000 },
  { id: 6, name: 'Palm Meadows', locality: 'Kharghar', city: 'Navi Mumbai', status: 'Ready to Move', slug: 'palm-meadows', cover_image: '/images/tower-c.jpg', description: 'Luxury golf-course view residences in Kharghar.', price_min: 12500000, price_max: 32000000 },
  { id: 7, name: 'Nexzone Aria', locality: 'Panvel', city: 'Navi Mumbai', status: 'Under Construction', slug: 'nexzone-aria', cover_image: '/images/tower-b.jpg', description: 'Modern high-tech township near Panvel airport hub.', price_min: 8500000, price_max: 19000000 },
  { id: 8, name: 'Urbania Crown', locality: 'Majiwada', city: 'Thane', status: 'Ready to Move', slug: 'urbania-crown', cover_image: '/images/tower-a.jpg', description: 'Integrated luxury township at Majiwada junction.', price_min: 14000000, price_max: 35000000 },
  { id: 9, name: 'Ghodbunder Gateway', locality: 'Ghodbunder Road', city: 'Thane', status: 'New Launch', slug: 'ghodbunder-gateway', cover_image: '/images/tower-c.jpg', description: 'Scenic green towers along Ghodbunder corridor.', price_min: 11000000, price_max: 28000000 },
  { id: 10, name: 'Riverside County', locality: 'Panvel', city: 'Navi Mumbai', status: 'Under Construction', slug: 'riverside-county', cover_image: '/images/villa-a.jpg', description: 'Riverfront villas and penthouse residences.', price_min: 16000000, price_max: 45000000 },
  { id: 11, name: 'Grand Central Seawoods', locality: 'Nerul', city: 'Navi Mumbai', status: 'Ready to Move', slug: 'grand-central-seawoods', cover_image: '/images/tower-a.jpg', description: 'Integrated transit-oriented luxury enclave in Seawoods.', price_min: 24000000, price_max: 60000000 },
  { id: 12, name: 'Godrej Hills Retreat', locality: 'Kharghar', city: 'Navi Mumbai', status: 'New Launch', slug: 'godrej-hills-retreat', cover_image: '/images/tower-b.jpg', description: 'Hillside forest-theme luxury apartments.', price_min: 13500000, price_max: 31000000 },
];

async function validateForeignKeys(body) {
  if (body.project_id !== undefined && body.project_id !== null && body.project_id !== '') {
    const pid = Number(body.project_id);
    if (isNaN(pid) || pid <= 0) {
      body.project_id = null;
    } else {
      const { data: dbProj } = await supabase.from('projects').select('id').eq('id', pid).maybeSingle();
      if (dbProj?.id) {
        body.project_id = dbProj.id;
      } else {
        const fallbackDef = DEFAULT_PROJECTS.find((p) => p.id === pid);
        if (fallbackDef) {
          let { data: matched } = await supabase.from('projects').select('id').eq('slug', fallbackDef.slug).maybeSingle();
          if (!matched) {
            const { id: _ignore, ...toInsert } = fallbackDef;
            const { data: seeded } = await supabase.from('projects').insert(toInsert).select('id').maybeSingle();
            matched = seeded;
          }
          body.project_id = matched?.id || null;
        } else {
          body.project_id = null;
        }
      }
    }
  } else if ('project_id' in body) {
    body.project_id = null;
  }

  if (body.developer_id !== undefined && body.developer_id !== null && body.developer_id !== '') {
    const did = Number(body.developer_id);
    if (isNaN(did) || did <= 0) {
      body.developer_id = null;
    } else {
      const { data } = await supabase.from('developers').select('id').eq('id', did).maybeSingle();
      if (!data) body.developer_id = null;
      else body.developer_id = did;
    }
  } else if ('developer_id' in body) {
    body.developer_id = null;
  }
}

async function savePropertyAmenities(propertyId, amenityNames, amenityIds) {
  await supabase.from('property_amenities').delete().eq('property_id', propertyId);
  const idsToLink = new Set();
  if (Array.isArray(amenityIds)) {
    amenityIds.forEach((id) => idsToLink.add(Number(id)));
  }
  if (Array.isArray(amenityNames)) {
    for (const name of amenityNames) {
      const cleanName = String(name).trim();
      if (!cleanName) continue;
      let { data: existing } = await supabase.from('amenities').select('id').ilike('name', cleanName).maybeSingle();
      if (!existing) {
        const { data: created } = await supabase.from('amenities').insert({ name: cleanName, category: 'General' }).select('id').single();
        if (created) existing = created;
      }
      if (existing?.id) {
        idsToLink.add(existing.id);
      }
    }
  }
  if (idsToLink.size > 0) {
    const rows = Array.from(idsToLink).map((amenity_id) => ({
      property_id: propertyId,
      amenity_id,
    }));
    await supabase.from('property_amenities').insert(rows);
  }
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const q0 = req.query || {};
      const { id, slug, city, locality, localities, min_price, max_price, min_area, max_area, bedrooms, bathrooms, property_type, status, listing_type, furnishing, search, sort, featured, is_active, limit, page, ids, project_id, developer_id, rera } = q0;
      if (id) {
        const { data, error } = await supabase.from('properties').select(DETAIL_SELECT).eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (slug) {
        const { data, error } = await supabase.from('properties').select(DETAIL_SELECT).eq('slug', slug).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let q = supabase.from('properties').select(LIST_SELECT, { count: 'exact' });
      if (is_active !== 'all') q = q.eq('is_active', true);
      if (city) q = q.eq('city', city);
      if (locality) q = q.eq('locality', locality);
      if (localities) q = q.in('locality', String(localities).split(',').map((s) => s.trim()));
      if (ids) q = q.in('id', String(ids).split(',').map(Number).filter(Boolean));
      if (project_id) q = q.eq('project_id', project_id);
      if (developer_id) q = q.eq('developer_id', developer_id);
      if (min_price) q = q.gte('price', Number(min_price));
      if (max_price) q = q.lte('price', Number(max_price));
      if (min_area) q = q.gte('area_sqft', Number(min_area));
      if (max_area) q = q.lte('area_sqft', Number(max_area));
      if (bedrooms) q = q.in('bedrooms', String(bedrooms).split(',').map(Number));
      if (bathrooms) q = q.gte('bathrooms', Number(bathrooms));
      if (property_type) q = q.in('property_type', String(property_type).split(',').map((s) => s.trim()));
      if (status) q = q.in('status', String(status).split(',').map((s) => s.trim()));
      if (listing_type) q = q.eq('listing_type', listing_type);
      if (furnishing) q = q.eq('furnishing', furnishing);
      if (featured === 'true') q = q.eq('featured', true);
      if (rera === 'true') q = q.eq('rera_approved', true);
      if (search) {
        const s = String(search).replace(/[%(),]/g, ' ').trim().slice(0, 80);
        if (s) q = q.or(`title.ilike.%${s}%,locality.ilike.%${s}%,address.ilike.%${s}%,city.ilike.%${s}%`);
      }
      const sortMap = { price_asc: ['price', true], price_desc: ['price', false], area_desc: ['area_sqft', false], area_asc: ['area_sqft', true], newest: ['created_at', false], popular: ['views', false] };
      const sm = sortMap[String(sort)] || ['created_at', false];
      q = q.order(sm[0], { ascending: sm[1], nullsFirst: false }).order('id', { ascending: false });
      const lim = Math.min(Number(limit) || 12, 100);
      const pg = Math.max(Number(page) || 1, 1);
      q = q.range((pg - 1) * lim, pg * lim - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return res.status(200).json({ data: data || [], total: count ?? (data || []).length, page: pg, limit: lim });
    }
    if (req.method === 'POST') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const { amenity_ids, amenity_names, images, ...rest } = req.body || {};
      const body = cleanBody(rest);
      if (!body.title) return res.status(400).json({ error: 'Title is required' });
      if (!body.slug) body.slug = `${slugify(body.title)}-${Date.now().toString(36)}`;
      await validateForeignKeys(body);
      const { data, error } = await supabase.from('properties').insert(body).select().single();
      if (error) throw error;
      audit(req, auth, 'create', 'property', data.id, { title: data.title });
      await savePropertyAmenities(data.id, amenity_names, amenity_ids);
      if (Array.isArray(images) && images.length) {
        await supabase.from('property_images').insert(images.map((img, i) => ({ property_id: data.id, image_url: typeof img === 'string' ? img : img.image_url, caption: (img && img.caption) || '', sort_order: i })));
      }
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const { id, amenity_ids, amenity_names, images, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const body = cleanBody(rest);
      await validateForeignKeys(body);
      const { data, error } = await supabase.from('properties').update(body).eq('id', id).select().single();
      if (error) throw error;
      audit(req, auth, 'update', 'property', id, { fields: Object.keys(body) });
      if (Array.isArray(amenity_ids) || Array.isArray(amenity_names)) {
        await savePropertyAmenities(id, amenity_names, amenity_ids);
      }
      if (Array.isArray(images)) {
        await supabase.from('property_images').delete().eq('property_id', id);
        if (images.length) await supabase.from('property_images').insert(images.map((img, i) => ({ property_id: id, image_url: typeof img === 'string' ? img : img.image_url, caption: (img && img.caption) || '', sort_order: i })));
      }
      return res.status(200).json(data);
    }
    if (req.method === 'PATCH') {
      const { id, op } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      if (op === 'view') {
        const { data: row } = await supabase.from('properties').select('views').eq('id', id).single();
        const { data, error } = await supabase.from('properties').update({ views: (row?.views || 0) + 1 }).eq('id', id).select('id,views').single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      return res.status(400).json({ error: 'Unknown op' });
    }
    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await supabase.from('property_amenities').delete().eq('property_id', id);
      await supabase.from('property_images').delete().eq('property_id', id);
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'property', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API properties error:', err);
    res.status(500).json({ error: err.message });
  }
}
