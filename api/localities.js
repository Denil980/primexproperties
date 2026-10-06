import supabase from './db-client.js';
import { requireRole, slugify, setCors, SALES_ROLES, CONTENT_ROLES, ADMIN_ROLES, audit } from './_auth.js';

const DEFAULT_LOCALITIES = [
  {
    slug: 'kharghar',
    name: 'Kharghar',
    city: 'Navi Mumbai',
    tagline: "Best properties in Kharghar — Navi Mumbai's greenest, best-planned node",
    image: '/images/tower-c.jpg',
    avg_price: '₹11,200 / sq.ft',
    price_range: '₹75 L – ₹2.4 Cr',
    rental_yield: '3.6 – 4.1%',
    connectivity: ['Kharghar & Mansarovar railway stations (Harbour line)', 'Sion–Panvel Expressway & Mumbai–Pune Expressway access', 'Upcoming Navi Mumbai International Airport (20 min)', 'Kharghar–Turbhe Tunnel Rd & Metro Line 1 connectivity'],
    highlights: ['Central Park & Kharghar Hills golf course greens', 'Top schools: Ryan, Vibgyor, DY Patil University', 'Little World & Glomax malls + high-street retail', 'CIDCO-planned sectors with wide roads & gardens'],
    intro: [
      "Kharghar is widely regarded as Navi Mumbai's most liveable node — a CIDCO-planned township wrapped around Central Park, the Kharghar Hills and an 18-hole golf course. For families seeking the best properties in Kharghar, the micro-market offers everything from efficient 1 BHKs near the station to sprawling 3 BHK sky-villas in Sector 35–36.",
      'Demand here is driven by education and healthcare infrastructure (DY Patil University, Tata Memorial ACTREC) plus seamless connectivity to the upcoming Navi Mumbai International Airport. Capital values have appreciated 8–11% annually over the last five years, with rental demand from students and professionals keeping yields healthy.',
      'Primex Properties curates only MahaRERA-verified inventory in Kharghar — across Sectors 4, 7, 12, 20, 27, 34, 35 and 36 — with transparent carpet-area disclosures and negotiated launch pricing.',
    ],
    faqs: [
      { q: 'What is the average flat price in Kharghar?', a: 'As of 2026, resale and new-launch apartments in Kharghar average ₹10,500–₹12,000 per sq.ft. A 2 BHK (650–750 sq.ft carpet) typically costs ₹80 L–₹1.15 Cr depending on sector and floor.' },
      { q: 'Is Kharghar good for investment?', a: 'Yes — Kharghar combines CIDCO planning, metro + airport connectivity and institutional demand from DY Patil and corporate parks. Primex data shows 8–11% annual appreciation with 3.6–4.1% rental yields.' },
      { q: 'Which sectors are best in Kharghar?', a: 'Sector 35–36 (golf-course facing premium towers), Sector 12 (station proximity) and Sector 20 (Central Park frontage) command the strongest resale premiums.' },
    ],
  },
  {
    slug: 'belapur',
    name: 'Belapur',
    city: 'Navi Mumbai',
    tagline: 'Best properties in Belapur — the CBD crown of Navi Mumbai',
    image: '/images/tower-a.jpg',
    avg_price: '₹14,800 / sq.ft',
    price_range: '₹1.1 Cr – ₹4.2 Cr',
    rental_yield: '3.4 – 3.9%',
    connectivity: ['CBD Belapur railway + upcoming Metro Line 1 interchange', 'Palm Beach Road & Sion–Panvel Expressway', 'Atal Setu (MTHL) — South Mumbai in ~40 min', 'Nerul–Uran line & airport link via Ulwe'],
    highlights: ["Navi Mumbai's administrative & corporate capital", 'Wonders Park, Parsik Hills treks & Belapur Jetty', 'Inorbit, Raghuleela & premium high-street dining', 'Top schools: DPS Nerul, Apeejay, Goldcrest nearby'],
    intro: [
      "CBD Belapur is Navi Mumbai's beating heart — home to RBI, Konkan Bhavan, top PSUs and a fast-growing corporate corridor along Palm Beach Road. Buyers searching for the best properties in Belapur are typically CXOs, bankers and NRI investors who value walk-to-work convenience and sea-facing Palm Beach frontage.",
      'The micro-market skews premium: 2.5–4 BHK residences in Sectors 11, 15 and 20, plus luxury towers along Palm Beach Road with creek views. The Atal Setu sea bridge has structurally repriced Belapur — South Mumbai is now a 40-minute drive, and corporate leasing demand keeps vacancy near zero.',
      "Primex holds preferred allotments across Belapur's top RERA-approved towers, including pre-launch inventory in Sector 15 and resale mandates on Palm Beach Road.",
    ],
    faqs: [
      { q: 'What do flats cost in Belapur CBD?', a: 'In 2026, Belapur averages ₹13,500–₹16,500 per sq.ft. A premium 2 BHK starts near ₹1.15 Cr, while 3 BHKs on Palm Beach Road range ₹1.9–₹3.4 Cr.' },
      { q: 'Is Belapur well connected to Mumbai?', a: 'Exceptionally. Harbour-line trains, the Sion–Panvel Expressway and the Atal Setu (MTHL) connect Belapur to South Mumbai, BKC and Thane. Metro Line 1 adds last-mile ease.' },
      { q: 'Why invest in Belapur over other nodes?', a: 'Belapur is the administrative capital with the deepest corporate tenancy in Navi Mumbai, ensuring resilient rentals and the strongest long-term capital protection.' },
    ],
  },
  {
    slug: 'vashi',
    name: 'Vashi',
    city: 'Navi Mumbai',
    tagline: "Best properties in Vashi — MMR's most connected address",
    image: '/images/hero-skyline.jpg',
    avg_price: '₹16,400 / sq.ft',
    price_range: '₹1.3 Cr – ₹5 Cr',
    rental_yield: '3.2 – 3.7%',
    connectivity: ['Vashi railway (Harbour + Trans-Harbour) & highway hub', 'Eastern Express corridor via Mankhurd–Vashi bridge', 'Palm Beach Road to Belapur & Nerul in minutes', 'Upcoming Metro Line 1 & airport link'],
    highlights: ['Inorbit, Raghuleela & Vashi Plaza retail core', 'APMC & IT parks driving white-collar rentals', 'MGM & Fortis hospitals + top schools', 'Mini Seashore & Sagar Vihar waterfront promenades'],
    intro: [
      'Vashi is the original — and still the most liquid — address in Navi Mumbai. As the first developed node, it offers Mumbai-grade social infrastructure: Inorbit Mall, APMC, IT parks, Fortis and MGM hospitals, and the beloved Mini Seashore promenade. The best properties in Vashi sit in Sectors 9, 10, 17 and along Sagar Vihar\'s waterfront.',
      'Values here are the highest in Navi Mumbai outside Palm Beach frontage, but so is liquidity — well-priced Vashi listings routinely close within 30 days. The buyer mix spans end-users upgrading within the node to Mumbai investors seeking stable, low-vacancy rentals.',
      'Primex specialises in Vashi resales and redevelopment mandates, with off-market access in Sectors 9, 10, 14 and 17 — plus new-tower inventory near the highway corridor.',
    ],
    faqs: [
      { q: 'What is the price of flats in Vashi?', a: 'Vashi averages ₹15,000–₹18,000 per sq.ft in 2026. 2 BHKs start around ₹1.35 Cr in mid sectors; Sagar Vihar waterfront 3 BHKs command ₹3–₹5 Cr.' },
      { q: 'Which is the best sector to live in Vashi?', a: 'Sector 17 (station + Inorbit), Sector 9–10 (established, green) and Sagar Vihar (waterfront premium) are the most sought-after pockets.' },
      { q: 'Is Vashi good for rental income?', a: 'Yes — APMC traders, IT professionals and hospital staff create deep, year-round rental demand with near-zero vacancy in prime sectors.' },
    ],
  },
  {
    slug: 'nerul',
    name: 'Nerul',
    city: 'Navi Mumbai',
    tagline: 'Flats in Nerul — balanced living between two CBDs',
    image: '/images/tower-b.jpg',
    avg_price: '₹13,600 / sq.ft',
    price_range: '₹95 L – ₹3.2 Cr',
    rental_yield: '3.5 – 4.0%',
    connectivity: ['Nerul railway (Harbour + Trans-Harbour + Uran link)', 'Palm Beach Road — 10 min to Vashi & Belapur', 'Seawoods Grand Central & Nexus Mall district', 'Upcoming airport connectivity via Ulwe'],
    highlights: ["Seawoods Grand Central — MMR's largest mall", 'Wonders Park & Rock Garden family zones', 'DY Patil Stadium events district', 'Premium schools: DPS, Goldcrest, Ryan'],
    intro: [
      'Nerul sits perfectly between Vashi and Belapur on Palm Beach Road, offering CBD access without CBD prices. Flats in Nerul attract young families and first-time luxury buyers — particularly in Sectors 28, 44, 46 and the Seawoods estate with its Grand Central mall integration.',
      'The Seawoods–Nerul corridor has seen the sharpest infrastructure-led appreciation in Navi Mumbai, with Palm Beach frontage towers commanding Belapur-like premiums. Trans-Harbour connectivity to Thane adds a second employment catchment.',
      'Primex lists RERA-verified new launches and resales across Nerul, with particular depth in Seawoods and Sector 44–48 family clusters.',
    ],
    faqs: [
      { q: 'What do 2 BHK flats cost in Nerul?', a: 'A 2 BHK in Nerul ranges ₹95 L–₹1.5 Cr depending on sector; Seawoods-fronting towers trade at a 15–20% premium.' },
      { q: 'Is Seawoods part of Nerul?', a: 'Yes — Seawoods is Sector 40–48 of Nerul, developed as a premium sub-node around Grand Central Mall and Seawoods railway station.' },
    ],
  },
  {
    slug: 'thane-west',
    name: 'Thane West',
    city: 'Thane',
    tagline: 'Flats in Thane West — Ghodbunder Road, Majiwada & Kolshet',
    image: '/images/thane-lake.jpg',
    avg_price: '₹12,400 / sq.ft',
    price_range: '₹85 L – ₹3.8 Cr',
    rental_yield: '3.3 – 3.8%',
    connectivity: ['Thane railway hub + upcoming Metro Lines 4 & 5', 'Eastern Express Highway & Ghodbunder corridor', 'Upcoming Thane–Borivali twin tunnel (~15 min to WEH)', 'Waterways & Bullet train terminal proximity'],
    highlights: ['Viviana, Korum & R-Mall retail clusters', 'Upvan Lake, Yeoor Hills & green reserves', 'Singhania, Hiranandani Foundation & EuroSchool', 'Bethany & Jupiter super-speciality hospitals'],
    intro: [
      'Thane West has transformed from a suburban satellite into a self-sustaining metropolis with 30+ lakes, Yeoor Hills backdrop, and top-tier infrastructure. Homebuyers seeking flats in Thane West choose between established clusters like Panchpakhadi and Majiwada, or booming corridors like Ghodbunder Road and Kolshet.',
      'Infrastructure is the key driver: Metro Line 4 (Wadala–Thane–Kasarvadavali) and the Thane–Borivali twin tunnel will cut travel times dramatically. High-end gated communities by Hiranandani, Lodha, Kalpataru and Rustomjee offer resort-style amenities at prices 30–40% below Western Suburbs.',
      'Primex holds direct developer access across Ghodbunder Road, Kolshet, Majiwada and Pokhran Road corridors.',
    ],
    faqs: [
      { q: 'What are property rates in Thane West?', a: 'Thane West averages ₹11,000–₹14,000 per sq.ft in 2026. 2 BHKs range ₹90 L–₹1.4 Cr along Ghodbunder Road and ₹1.5–₹2.2 Cr in Pokhran Road.' },
      { q: 'Will the Thane–Borivali tunnel boost prices?', a: 'Yes — the 11.8 km tunnel will connect Ghodbunder to Western Express Highway in 15 minutes, driving strong capital appreciation along the corridor.' },
    ],
  },
  {
    slug: 'powai',
    name: 'Powai',
    city: 'Mumbai',
    tagline: 'Luxury flats in Powai — lake views & startup hub living',
    image: '/images/tower-b.jpg',
    avg_price: '₹22,500 / sq.ft',
    price_range: '₹1.8 Cr – ₹7.5 Cr',
    rental_yield: '3.0 – 3.5%',
    connectivity: ['JVLR (Jogeshwari–Vikhroli Link Road) & LBS Marg', 'Upcoming Metro Line 6 (Swami Samarth Nagar–Vikhroli)', 'Kanjurmarg & Vikhroli railway stations', 'Mumbai Airport (T2) in ~25 minutes'],
    highlights: ['Powai Lake & Hiranandani Gardens streetscape', 'IIT Bombay & top tech/analytics hubs', 'Haiko, Galleria & high-street cafes', 'L&T Healthcare & Dr L H Hiranandani Hospital'],
    intro: [
      'Powai is Mumbai\'s premier planned township — an elegant enclave built around Powai Lake, framed by the IIT Bombay campus and the European-style Hiranandani Gardens. Searching for luxury flats in Powai leads to high-rise sky residences with lake views, private parks and walking access to corporate towers.',
      'Powai attracts tech founders, investment bankers, IIT alumni and senior expats. The startup ecosystem and corporate parks (Hiranandani Business Park, Kensington) create deep rental demand with the highest average rents outside South Mumbai/BKC.',
      'Primex manages a portfolio of resale and developer inventory across Hiranandani Gardens, Raheja Vihar and Chandivali corridors.',
    ],
    faqs: [
      { q: 'How much does a 2 BHK cost in Powai?', a: 'Powai averages ₹20,000–₹25,000 per sq.ft in 2026. A 2 BHK in Hiranandani Gardens ranges ₹1.9–₹2.8 Cr; Chandivali/JVLR options start near ₹1.6 Cr.' },
      { q: 'Is Powai good for expat & corporate rentals?', a: 'Powai has one of MMR\'s strongest corporate rental catchments, driven by MNC headquarters, IT parks and IIT Bombay faculty.' },
    ],
  },
];

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const q0 = req.query || {};
      const { id, slug } = q0;
      if (id || slug) {
        let q = supabase.from('localities').select('*');
        if (id) q = q.eq('id', id); else q = q.eq('slug', slug);
        const { data, error } = await q.single();
        if (!error && data) return res.status(200).json(data);
        // Fallback search in DEFAULT_LOCALITIES
        const fb = DEFAULT_LOCALITIES.find(l => (id && String(l.id) === String(id)) || (slug && l.slug === slug));
        if (fb) return res.status(200).json(fb);
        return res.status(404).json({ error: 'Locality not found' });
      }

      let { data, error, count } = await supabase.from('localities').select('*', { count: 'exact' }).order('id', { ascending: false });
      if (error) console.error('Fetch localities DB error:', error);

      if (!data || data.length === 0) {
        const { data: seeded, error: seedErr } = await supabase.from('localities').insert(DEFAULT_LOCALITIES).select('*');
        if (seedErr) console.error('Seeding localities error:', seedErr);
        if (!seedErr && seeded && seeded.length) {
          data = seeded;
          count = seeded.length;
        } else {
          data = DEFAULT_LOCALITIES.map((l, i) => ({ id: i + 1, ...l }));
          count = data.length;
        }
      }

      // Map snake_case DB columns to camelCase expected by components
      const formatted = (data || []).map(l => ({
        id: l.id,
        slug: l.slug,
        name: l.name,
        city: l.city,
        tagline: l.tagline || '',
        image: l.image || '/images/tower-a.jpg',
        avgPrice: l.avgPrice || l.avg_price || '',
        priceRange: l.priceRange || l.price_range || '',
        rentalYield: l.rentalYield || l.rental_yield || '',
        connectivity: Array.isArray(l.connectivity) ? l.connectivity : (typeof l.connectivity === 'string' ? JSON.parse(l.connectivity) : []),
        highlights: Array.isArray(l.highlights) ? l.highlights : (typeof l.highlights === 'string' ? JSON.parse(l.highlights) : []),
        intro: Array.isArray(l.intro) ? l.intro : (typeof l.intro === 'string' ? JSON.parse(l.intro) : [l.intro || '']),
        faqs: Array.isArray(l.faqs) ? l.faqs : (typeof l.faqs === 'string' ? JSON.parse(l.faqs) : []),
        created_at: l.created_at,
      }));

      return res.status(200).json({ data: formatted, total: count ?? formatted.length });
    }

    if (req.method === 'POST') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const body = { ...(req.body || {}) };
      delete body.id; delete body.created_at;
      if (!body.name) return res.status(400).json({ error: 'Name is required' });
      if (!body.slug) body.slug = slugify(body.name);

      const dbRow = {
        name: body.name,
        slug: body.slug,
        city: body.city || 'Navi Mumbai',
        tagline: body.tagline || '',
        image: body.image || '/images/tower-a.jpg',
        avg_price: body.avgPrice || body.avg_price || '',
        price_range: body.priceRange || body.price_range || '',
        rental_yield: body.rentalYield || body.rental_yield || '',
        connectivity: Array.isArray(body.connectivity) ? body.connectivity : (body.connectivity ? String(body.connectivity).split('\n').filter(Boolean) : []),
        highlights: Array.isArray(body.highlights) ? body.highlights : (body.highlights ? String(body.highlights).split('\n').filter(Boolean) : []),
        intro: Array.isArray(body.intro) ? body.intro : (body.intro ? String(body.intro).split('\n\n').filter(Boolean) : []),
        faqs: Array.isArray(body.faqs) ? body.faqs : [],
      };

      const { data, error } = await supabase.from('localities').insert(dbRow).select('*').single();
      if (error) throw error;
      audit(req, auth, 'create', 'locality', data.id, { name: data.name });
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const auth = await requireRole(req, res, [...SALES_ROLES, ...CONTENT_ROLES]);
      if (!auth) return;
      const { id, ...rest } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });

      const dbRow = {
        name: rest.name,
        slug: rest.slug ? slugify(rest.slug) : slugify(rest.name),
        city: rest.city || 'Navi Mumbai',
        tagline: rest.tagline || '',
        image: rest.image || '/images/tower-a.jpg',
        avg_price: rest.avgPrice || rest.avg_price || '',
        price_range: rest.priceRange || rest.price_range || '',
        rental_yield: rest.rentalYield || rest.rental_yield || '',
        connectivity: Array.isArray(rest.connectivity) ? rest.connectivity : (rest.connectivity ? String(rest.connectivity).split('\n').filter(Boolean) : []),
        highlights: Array.isArray(rest.highlights) ? rest.highlights : (rest.highlights ? String(rest.highlights).split('\n').filter(Boolean) : []),
        intro: Array.isArray(rest.intro) ? rest.intro : (rest.intro ? String(rest.intro).split('\n\n').filter(Boolean) : []),
        faqs: Array.isArray(rest.faqs) ? rest.faqs : [],
      };

      const { data, error } = await supabase.from('localities').update(dbRow).eq('id', id).select('*').single();
      if (error) throw error;
      audit(req, auth, 'update', 'locality', id, { fields: Object.keys(dbRow) });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const auth = await requireRole(req, res, ADMIN_ROLES);
      if (!auth) return;
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('localities').delete().eq('id', id);
      if (error) throw error;
      audit(req, auth, 'delete', 'locality', id);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API localities error:', err);
    res.status(500).json({ error: err.message });
  }
}
