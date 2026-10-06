import supabase from './db-client.js';
import { requireRole, slugify, setCors, SALES_ROLES, CONTENT_ROLES, ADMIN_ROLES, audit } from './_auth.js';

const SELECT = '*, developers(id,name,hq,rating)';

const DEFAULT_PROJECTS = [
  { name: 'Worli Sea Crest', slug: 'worli-sea-crest', city: 'Mumbai', locality: 'Worli', address: 'Dr Annie Besant Rd, Worli, Mumbai, Maharashtra 400018', description: 'Iconic sea-facing luxury towers in Worli offering unobstructed Bandra-Worli Sea Link views, private elevators and world-class lifestyle amenities.', status: 'Ready to Move', configurations: '3, 4 & 5 BHK', possession_date: 'Ready to Move', price_min: 45000000, price_max: 120000000, total_units: 120, tower_count: 2, rera_number: 'P51900001892', rera_status: 'Approved', cover_image: '/images/tower-a.jpg', amenities_text: 'Infinity Swimming Pool, Sky Lounge, Clubhouse, Private Elevator, Gymnasium, Spa & Sauna, 24x7 Security', featured: true, developer_id: 4 },
  { name: 'Hiranandani Oakwood', slug: 'hiranandani-oakwood', city: 'Mumbai', locality: 'Powai', address: 'Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076', description: 'High-rise luxury living overlooking Powai Lake, featuring neoclassical architecture, expansive green gardens, and township conveniences.', status: 'Ready to Move', configurations: '2, 3 & 4 BHK', possession_date: 'Ready to Move', price_min: 32000000, price_max: 75000000, total_units: 240, tower_count: 3, rera_number: 'P51800002415', rera_status: 'Approved', cover_image: '/images/tower-b.jpg', amenities_text: 'Swimming Pool, Tennis Court, Squash Court, Landscaped Gardens, Clubhouse, Power Backup, High-speed Lifts', featured: true, developer_id: 3 },
  { name: 'Serenity Lakeside', slug: 'serenity-lakeside', city: 'Thane', locality: 'Thane West', address: 'Off Eastern Express Highway, Thane West, Thane 400601', description: 'Lakeside township with premium lifestyle amenities, serene forest views, and fast connectivity to Eastern Express Highway.', status: 'Under Construction', configurations: '2 & 3 BHK', possession_date: 'Dec 2027', price_min: 18000000, price_max: 42000000, total_units: 350, tower_count: 4, rera_number: 'P51700008920', rera_status: 'Approved', cover_image: '/images/thane-lake.jpg', amenities_text: 'Lakeside Promenade, Jogging Track, Yoga Pavilion, Amphitheatre, Creche, Kids Play Area, EV Charging', featured: true, developer_id: 6 },
  { name: 'Sagar Vihar Waterfront', slug: 'sagar-vihar-waterfront', city: 'Navi Mumbai', locality: 'Vashi', address: 'Sector 8, Vashi, Navi Mumbai, Maharashtra 400703', description: 'Waterfront luxury residences in Sector 8 Vashi, offering uninterrupted Thane Creek sunset views and walking access to Inorbit Mall.', status: 'Ready to Move', configurations: '3 & 4 BHK', possession_date: 'Ready to Move', price_min: 22000000, price_max: 55000000, total_units: 90, tower_count: 2, rera_number: 'P52000003411', rera_status: 'Approved', cover_image: '/images/hero-skyline.jpg', amenities_text: 'Sea Deck, Rooftop Lounge, Heated Pool, Business Centre, Covered Parking, 24x7 CCTV', featured: false, developer_id: 6 },
  { name: 'Belapur Crest', slug: 'belapur-crest', city: 'Navi Mumbai', locality: 'Belapur', address: 'Sector 15, CBD Belapur, Navi Mumbai, Maharashtra 400614', description: 'CBD Belapur landmark high-rise offering creek-facing smart homes with rapid access to Belapur Railway Station and Palm Beach Road.', status: 'Under Construction', configurations: '2 & 3 BHK', possession_date: 'Jun 2027', price_min: 15000000, price_max: 38000000, total_units: 180, tower_count: 2, rera_number: 'P52000015672', rera_status: 'Approved', cover_image: '/images/tower-a.jpg', amenities_text: 'Smart Home Automation, Infinity Edge Pool, Gymnasium, Badminton Court, Senior Citizen Deck', featured: false, developer_id: 5 },
  { name: 'Palm Meadows', slug: 'palm-meadows', city: 'Navi Mumbai', locality: 'Kharghar', address: 'Sector 35, Kharghar, Navi Mumbai, Maharashtra 410210', description: 'Luxury golf-course view residences in Sector 35 Kharghar, adjacent to Central Park and Metro Station.', status: 'Ready to Move', configurations: '2, 3 & 4 BHK', possession_date: 'Ready to Move', price_min: 12500000, price_max: 32000000, total_units: 210, tower_count: 3, rera_number: 'P52000007823', rera_status: 'Approved', cover_image: '/images/tower-c.jpg', amenities_text: 'Golf Putting Green, Clubhouse, Swimming Pool, Cricket Pitch, Co-work Lounge, Pet Park', featured: false, developer_id: 5 },
  { name: 'Nexzone Aria', slug: 'nexzone-aria', city: 'Navi Mumbai', locality: 'Panvel', address: 'Palaspe Phata, NH 4, Panvel, Navi Mumbai, Maharashtra 410206', description: 'Modern high-tech township project situated right on the airport growth corridor near Navi Mumbai International Airport.', status: 'Under Construction', configurations: '1, 2 & 3 BHK', possession_date: 'Dec 2028', price_min: 8500000, price_max: 19000000, total_units: 480, tower_count: 5, rera_number: 'P52000021980', rera_status: 'Approved', cover_image: '/images/tower-b.jpg', amenities_text: 'Township Central Park, Mini Theatre, EV Charging Station, Multi-sports Court, Badminton Court', featured: false, developer_id: 10 },
  { name: 'Urbania Crown', slug: 'urbania-crown', city: 'Thane', locality: 'Majiwada', address: 'Majiwada Junction, Thane West, Thane, Maharashtra 400601', description: 'Integrated township development at Majiwada junction with child-centric parks, EuroSchool inside, and luxury clubhouse.', status: 'Ready to Move', configurations: '2 & 3 BHK', possession_date: 'Ready to Move', price_min: 14000000, price_max: 35000000, total_units: 320, tower_count: 3, rera_number: 'P51700004510', rera_status: 'Approved', cover_image: '/images/tower-a.jpg', amenities_text: 'Integrated School, Olympic Pool, Festival Lawn, Multi-tier Security, High-speed Lifts', featured: false, developer_id: 11 },
  { name: 'Ghodbunder Gateway', slug: 'ghodbunder-gateway', city: 'Thane', locality: 'Ghodbunder Road', address: 'Ghodbunder Road, Thane West, Thane, Maharashtra 400615', description: 'Scenic green towers along Ghodbunder corridor featuring Yeoor Hills forest view apartments and modern lifestyle amenities.', status: 'New Launch', configurations: '1, 2 & 3 BHK', possession_date: 'Mar 2029', price_min: 11000000, price_max: 28000000, total_units: 400, tower_count: 4, rera_number: 'P51700034912', rera_status: 'Approved', cover_image: '/images/tower-c.jpg', amenities_text: 'Sky Deck, Forest View Walkway, Rooftop Cafe, Swimming Pool, Gymnasium, Power Backup', featured: false, developer_id: 8 },
  { name: 'Riverside County', slug: 'riverside-county', city: 'Navi Mumbai', locality: 'Panvel', address: 'Near Gadi River, Old Panvel, Navi Mumbai, Maharashtra 410206', description: 'Riverfront luxury villas and penthouse residences offering tranquil waterfront views, private gardens and resort facilities.', status: 'Under Construction', configurations: '3, 4 BHK & Villas', possession_date: 'Sep 2027', price_min: 16000000, price_max: 45000000, total_units: 110, tower_count: 2, rera_number: 'P52000018765', rera_status: 'Approved', cover_image: '/images/villa-a.jpg', amenities_text: 'Riverfront Promenade, Private Lawns, Swimming Pool, Clubhouse, 24x7 Security, Solar Lighting', featured: false, developer_id: 7 },
  { name: 'Grand Central Seawoods', slug: 'grand-central-seawoods', city: 'Navi Mumbai', locality: 'Nerul', address: 'Seawoods Grand Central, Sector 40, Nerul, Navi Mumbai 400706', description: 'Integrated transit-oriented luxury enclave connected directly to Seawoods Railway Station and Nexus Seawoods Mall.', status: 'Ready to Move', configurations: '2, 3 & 4 BHK', possession_date: 'Ready to Move', price_min: 24000000, price_max: 60000000, total_units: 260, tower_count: 3, rera_number: 'P52000009124', rera_status: 'Approved', cover_image: '/images/tower-a.jpg', amenities_text: 'Transit Elevator, Infinity Pool, Rooftop Dining, Spa, Fitness Centre, Covered Parking', featured: false, developer_id: 9 },
  { name: 'Godrej Hills Retreat', slug: 'godrej-hills-retreat', city: 'Navi Mumbai', locality: 'Kharghar', address: 'Sector 36, Kharghar Hills, Navi Mumbai, Maharashtra 410210', description: 'Hillside forest-theme luxury resort apartments overlooking Kharghar Hills, with forest trails and sky lounge.', status: 'New Launch', configurations: '2 & 3 BHK', possession_date: 'Dec 2028', price_min: 13500000, price_max: 31000000, total_units: 380, tower_count: 4, rera_number: 'P52000041289', rera_status: 'Approved', cover_image: '/images/tower-b.jpg', amenities_text: 'Forest Trail, Hill View Deck, Camping Zone, Swimming Pool, Clubhouse, EV Charging', featured: false, developer_id: 2 }
];

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const q0 = req.query || {};
      const { id, slug, city, locality, status, featured, search, limit, developer_id, rera_status } = q0;
      if (id || slug) {
        let q = supabase.from('projects').select(SELECT);
        if (id) q = q.eq('id', id); else q = q.eq('slug', slug);
        const { data, error } = await q.single();
        if (error) throw error;
        const { data: units } = await supabase.from('properties').select('id,title,slug,price,bedrooms,bathrooms,area_sqft,cover_image,status').eq('project_id', data.id).eq('is_active', true).limit(20);
        return res.status(200).json({ ...data, units: units || [] });
      }
      let q = supabase.from('projects').select('*', { count: 'exact' }).order('id', { ascending: false });
      if (city) q = q.eq('city', city);
      if (locality) q = q.eq('locality', locality);
      if (status) q = q.in('status', String(status).split(','));
      if (developer_id) q = q.eq('developer_id', developer_id);
      if (rera_status) q = q.eq('rera_status', rera_status);
      if (featured === 'true') q = q.eq('featured', true);
      if (search) { const s = String(search).replace(/[%(),]/g, ' ').trim().slice(0, 80); if (s) q = q.or(`name.ilike.%${s}%,locality.ilike.%${s}%,city.ilike.%${s}%`); }
      if (limit) q = q.limit(Math.min(Number(limit), 100));
      let { data, error, count } = await q;
      if (error) throw error;

      if ((!data || data.length === 0) && !search && !city && !locality && !developer_id) {
        const { data: seeded, error: seedErr } = await supabase.from('projects').insert(DEFAULT_PROJECTS).select('*');
        if (seedErr) console.error('Seeding projects error:', seedErr);
        if (!seedErr && seeded && seeded.length) {
          data = seeded;
          count = seeded.length;
        } else {
          data = DEFAULT_PROJECTS.map((p, i) => ({ id: i + 1, ...p }));
          count = data.length;
        }
      }

      return res.status(200).json({ data: data || [], total: count ?? (data || []).length });
    }
    if (req.method === 'POST') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const body = { ...(req.body || {}) };
      delete body.id; delete body.developers; delete body.units; delete body.created_at;
      Object.keys(body).forEach((k) => { if (body[k] === '') body[k] = null; });
      if (!body.name) return res.status(400).json({ error: 'Name is required' });
      if (!body.slug) body.slug = `${slugify(body.name)}-${Date.now().toString(36)}`;
      const { data, error } = await supabase.from('projects').insert(body).select().single();
      if (error) throw error;
      audit(req, auth, 'create', 'project', data.id, { name: data.name });
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const { id, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const body = { ...rest };
      delete body.developers; delete body.units; delete body.created_at;
      Object.keys(body).forEach((k) => { if (body[k] === '') body[k] = null; });
      const { data, error } = await supabase.from('projects').update(body).eq('id', id).select().single();
      if (error) throw error;
      audit(req, auth, 'update', 'project', id, { fields: Object.keys(body) });
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await supabase.from('properties').update({ project_id: null }).eq('project_id', id);
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'project', id);
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) { console.error('API projects error:', err); res.status(500).json({ error: err.message }); }
}
