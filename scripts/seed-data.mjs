import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEVELOPERS = [
  {
    name: 'Godrej Properties',
    slug: 'godrej-properties',
    hq: 'Mumbai',
    rating: 4.9,
    founded_year: 1990,
    projects_delivered: 85,
    ongoing_projects: 28,
    featured: true,
    cover_image: '/images/tower-b.jpg',
    description: 'Godrej Properties brings the Godrej Group philosophy of innovation, sustainability, and excellence to the real estate industry, delivering landmark developments across Mumbai MMR.',
    website: 'https://www.godrejproperties.com',
  },
  {
    name: 'Hiranandani Group',
    slug: 'hiranandani-group',
    hq: 'Mumbai',
    rating: 4.8,
    founded_year: 1978,
    projects_delivered: 110,
    ongoing_projects: 18,
    featured: true,
    cover_image: '/images/tower-a.jpg',
    description: 'Pioneers of integrated township development in Powai and Thane. Celebrated for distinctive neoclassical architecture, lush landscaping, and lifestyle ecosystems.',
    website: 'https://www.hiranandani.com',
  },
  {
    name: 'Lodha Luxury',
    slug: 'lodha-luxury',
    hq: 'Mumbai',
    rating: 4.9,
    founded_year: 1980,
    projects_delivered: 140,
    ongoing_projects: 35,
    featured: true,
    cover_image: '/images/tower-c.jpg',
    description: "India's premier luxury real estate developer, creating world-class private residences, iconic skyscrapers, and hospitality-inspired enclaves in South Mumbai and MMR.",
    website: 'https://www.lodhagroup.in',
  },
  {
    name: 'L&T Realty',
    slug: 'lt-realty',
    hq: 'Mumbai',
    rating: 4.7,
    founded_year: 2011,
    projects_delivered: 42,
    ongoing_projects: 14,
    featured: true,
    cover_image: '/images/tower-a.jpg',
    description: 'The real estate arm of Larsen & Toubro, delivering transit-oriented developments, Grade-A business parks, and luxury gated communities across Navi Mumbai & Mumbai.',
    website: 'https://www.ltrealty.com',
  },
  {
    name: 'Kalpataru Limited',
    slug: 'kalpataru',
    hq: 'Mumbai',
    rating: 4.6,
    founded_year: 1969,
    projects_delivered: 105,
    ongoing_projects: 22,
    featured: true,
    cover_image: '/images/thane-lake.jpg',
    description: 'Over 5 decades of engineering excellence, specializing in high-rise waterfront and lakeside premium residential developments in Thane and Navi Mumbai.',
    website: 'https://www.kalpataru.com',
  },
  {
    name: 'Piramal Realty',
    slug: 'piramal-realty',
    hq: 'Mumbai',
    rating: 4.8,
    founded_year: 2012,
    projects_delivered: 26,
    ongoing_projects: 10,
    featured: true,
    cover_image: '/images/villa-a.jpg',
    description: 'Piramal Group real estate brand committed to biophilic design, panoramic natural views, and high architectural standards across premier waterfront locations.',
    website: 'https://www.piramalrealty.com',
  },
  {
    name: 'Rustomjee Group',
    slug: 'rustomjee',
    hq: 'Mumbai',
    rating: 4.7,
    founded_year: 1996,
    projects_delivered: 68,
    ongoing_projects: 16,
    featured: true,
    cover_image: '/images/tower-c.jpg',
    description: 'Renowned for thoughtful design, child-centric urban townships, and community-driven living spaces throughout Thane, Bandra, and Mumbai suburbs.',
    website: 'https://www.rustomjee.com',
  },
  {
    name: 'Oberoi Realty',
    slug: 'oberoi-realty',
    hq: 'Mumbai',
    rating: 4.9,
    founded_year: 1998,
    projects_delivered: 50,
    ongoing_projects: 12,
    featured: true,
    cover_image: '/images/hero-skyline.jpg',
    description: 'Ultra-premium developer delivering contemporary architectural landmarks, integrated retail malls, and luxury residences with pristine finishes.',
    website: 'https://www.oberoirealty.com',
  },
  {
    name: 'Marathon Realty',
    slug: 'marathon-realty',
    hq: 'Mumbai',
    rating: 4.5,
    founded_year: 1969,
    projects_delivered: 80,
    ongoing_projects: 15,
    featured: false,
    cover_image: '/images/tower-b.jpg',
    description: 'Innovators in urban infrastructure and township developments along the airport and industrial corridors of Navi Mumbai and Panvel.',
    website: 'https://www.marathon.in',
  },
  {
    name: 'The Wadhwa Group',
    slug: 'wadhwa-group',
    hq: 'Mumbai',
    rating: 4.6,
    founded_year: 1969,
    projects_delivered: 90,
    ongoing_projects: 19,
    featured: false,
    cover_image: '/images/tower-a.jpg',
    description: 'Celebrated for proprietary Ventilit design philosophy maximizing natural light, cross ventilation, and height in every residence across Thane & Mumbai.',
    website: 'https://www.thewadhwagroup.com',
  },
];

async function seed() {
  console.log('Seeding Developers...');
  const developerMap = {};
  for (const dev of DEVELOPERS) {
    const { data: existing } = await supabase.from('developers').select('id,slug').eq('slug', dev.slug).maybeSingle();
    if (existing) {
      developerMap[dev.slug] = existing.id;
    } else {
      const { data: created, error } = await supabase.from('developers').insert(dev).select('id,slug').single();
      if (error) console.error(`Error inserting developer ${dev.name}:`, error);
      else developerMap[dev.slug] = created.id;
    }
  }

  console.log('Updating Projects with Developer IDs...');
  const projectDevMapping = [
    { slug: 'worli-sea-crest', devSlug: 'lodha-luxury' },
    { slug: 'hiranandani-oakwood', devSlug: 'hiranandani-group' },
    { slug: 'serenity-lakeside', devSlug: 'kalpataru' },
    { slug: 'sagar-vihar-waterfront', devSlug: 'kalpataru' },
    { slug: 'belapur-crest', devSlug: 'lt-realty' },
    { slug: 'palm-meadows', devSlug: 'lt-realty' },
    { slug: 'nexzone-aria', devSlug: 'marathon-realty' },
    { slug: 'urbania-crown', devSlug: 'rustomjee' },
    { slug: 'ghodbunder-gateway', devSlug: 'wadhwa-group' },
    { slug: 'riverside-county', devSlug: 'piramal-realty' },
    { slug: 'grand-central-seawoods', devSlug: 'oberoi-realty' },
    { slug: 'godrej-hills-retreat', devSlug: 'godrej-properties' },
  ];

  const projectMap = {};
  const { data: existingProjects } = await supabase.from('projects').select('id,slug');
  for (const p of existingProjects || []) {
    projectMap[p.slug] = p.id;
  }

  for (const mapping of projectDevMapping) {
    const pid = projectMap[mapping.slug];
    const did = developerMap[mapping.devSlug];
    if (pid && did) {
      await supabase.from('projects').update({ developer_id: did }).eq('id', pid);
    }
  }

  console.log('Seeding Properties...');
  const PROPERTIES = [
    {
      title: 'Sea-Facing Sky Villa with Private Deck',
      slug: 'worli-sea-crest-sky-villa',
      city: 'Mumbai',
      locality: 'Worli',
      address: 'Worli Sea Crest, Dr Annie Besant Rd, Worli, Mumbai',
      description: 'Exclusive 4 BHK sea-facing sky villa in South Mumbai featuring double-height living areas, private elevator lobby, expansive sundeck overlooking the Bandra-Worli Sea Link, and custom Italian marble finishes.',
      property_type: 'Apartment',
      listing_type: 'Buy',
      status: 'Ready to Move',
      furnishing: 'Semi-Furnished',
      price: 85000000,
      price_per_sqft: 28333,
      area_sqft: 3000,
      carpet_note: '3,000 sq.ft usable carpet + 450 sq.ft private sundeck',
      bedrooms: 4,
      bathrooms: 5,
      balconies: 2,
      floor_no: '38',
      total_floors: 50,
      facing: 'West',
      parking: '3 Covered Spaces',
      possession_date: 'Ready to Move',
      rera_number: 'P51900001892',
      rera_approved: true,
      cover_image: '/images/penthouse-a.jpg',
      featured: true,
      is_active: true,
      views: 342,
      project_slug: 'worli-sea-crest',
      dev_slug: 'lodha-luxury',
      amenities: ['24x7 Security', 'Clubhouse', 'Covered Parking', 'High-speed Lifts', 'Power Backup', 'Infinity Pool', 'Gymnasium', 'Spa & Sauna'],
      gallery: ['/images/living-a.jpg', '/images/bedroom-a.jpg', '/images/bath-a.jpg', '/images/kitchen-a.jpg'],
    },
    {
      title: 'Lake-View Neoclassical 3 BHK Residence',
      slug: 'powai-oakwood-lakeview-residence',
      city: 'Mumbai',
      locality: 'Powai',
      address: 'Hiranandani Oakwood, Hiranandani Gardens, Powai, Mumbai',
      description: 'High-floor 3 BHK overlooking Powai Lake and the lush Hiranandani township. Includes signature Greek-arched windows, modular German kitchen, and bespoke wood flooring.',
      property_type: 'Apartment',
      listing_type: 'Buy',
      status: 'Ready to Move',
      furnishing: 'Fully-Furnished',
      price: 42000000,
      price_per_sqft: 23333,
      area_sqft: 1800,
      carpet_note: '1,800 sq.ft RERA carpet',
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      floor_no: '24',
      total_floors: 32,
      facing: 'North-East',
      parking: '2 Covered Spaces',
      possession_date: 'Ready to Move',
      rera_number: 'P51800002415',
      rera_approved: true,
      cover_image: '/images/living-b.jpg',
      featured: true,
      is_active: true,
      views: 289,
      project_slug: 'hiranandani-oakwood',
      dev_slug: 'hiranandani-group',
      amenities: ['Clubhouse', 'Swimming Pool', 'Tennis Court', 'Landscaped Gardens', 'High-speed Lifts', 'Power Backup'],
      gallery: ['/images/living-b.jpg', '/images/bedroom-a.jpg', '/images/kitchen-a.jpg'],
    },
    {
      title: 'Golf-Course Facing Penthouse with Private Terrace',
      slug: 'kharghar-palm-meadows-golf-penthouse',
      city: 'Navi Mumbai',
      locality: 'Kharghar',
      address: 'Palm Meadows, Sector 35, Kharghar, Navi Mumbai',
      description: 'Stunning 4 BHK duplex penthouse boasting 270-degree panoramic greens overlooking the 18-hole Kharghar Golf Course and Central Park hills. Features private rooftop plunge pool.',
      property_type: 'Penthouse',
      listing_type: 'Buy',
      status: 'Ready to Move',
      furnishing: 'Semi-Furnished',
      price: 24500000,
      price_per_sqft: 9800,
      area_sqft: 2500,
      carpet_note: '2,500 sq.ft carpet + 800 sq.ft open terrace',
      bedrooms: 4,
      bathrooms: 4,
      balconies: 3,
      floor_no: '28',
      total_floors: 28,
      facing: 'East',
      parking: '2 Covered Stilt',
      possession_date: 'Ready to Move',
      rera_number: 'P52000007823',
      rera_approved: true,
      cover_image: '/images/tower-c.jpg',
      featured: true,
      is_active: true,
      views: 412,
      project_slug: 'palm-meadows',
      dev_slug: 'lt-realty',
      amenities: ['Clubhouse', 'Swimming Pool', 'Cricket Pitch', '24x7 Security', 'Kids Play Area', 'Jogging Track'],
      gallery: ['/images/living-a.jpg', '/images/penthouse-a.jpg', '/images/bedroom-a.jpg'],
    },
    {
      title: 'Waterfront Sunset 3 BHK Apartment',
      slug: 'vashi-sagar-vihar-waterfront-suite',
      city: 'Navi Mumbai',
      locality: 'Vashi',
      address: 'Sagar Vihar Waterfront, Sector 8, Vashi, Navi Mumbai',
      description: 'Peaceful waterfront sanctuary in upscale Sector 8 Vashi. Unhindered creek sunset views, smart lighting controls, walking distance to Inorbit Mall and Vashi station.',
      property_type: 'Apartment',
      listing_type: 'Buy',
      status: 'Ready to Move',
      furnishing: 'Semi-Furnished',
      price: 36000000,
      price_per_sqft: 22500,
      area_sqft: 1600,
      carpet_note: '1,600 sq.ft clear carpet',
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      floor_no: '14',
      total_floors: 20,
      facing: 'West',
      parking: '2 Covered Spaces',
      possession_date: 'Ready to Move',
      rera_number: 'P52000003411',
      rera_approved: true,
      cover_image: '/images/hero-skyline.jpg',
      featured: true,
      is_active: true,
      views: 198,
      project_slug: 'sagar-vihar-waterfront',
      dev_slug: 'kalpataru',
      amenities: ['Clubhouse', 'Swimming Pool', '24x7 Security', 'Covered Parking', 'High-speed Lifts'],
      gallery: ['/images/hero-skyline.jpg', '/images/living-b.jpg', '/images/bath-a.jpg'],
    },
    {
      title: 'CBD Belapur Smart High-Rise Residence',
      slug: 'belapur-crest-smart-home',
      city: 'Navi Mumbai',
      locality: 'Belapur',
      address: 'Belapur Crest, Sector 15, CBD Belapur, Navi Mumbai',
      description: 'Corner 3 BHK residence with creek and city skyline views. Integrated home automation, infinity edge pool deck, and direct connectivity to Palm Beach Road and Belapur station.',
      property_type: 'Apartment',
      listing_type: 'Buy',
      status: 'Under Construction',
      furnishing: 'Unfurnished',
      price: 19500000,
      price_per_sqft: 15000,
      area_sqft: 1300,
      carpet_note: '1,300 sq.ft RERA carpet',
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      floor_no: '18',
      total_floors: 36,
      facing: 'South-West',
      parking: '1 Covered Space',
      possession_date: 'Jun 2027',
      rera_number: 'P52000015672',
      rera_approved: true,
      cover_image: '/images/tower-a.jpg',
      featured: true,
      is_active: true,
      views: 185,
      project_slug: 'belapur-crest',
      dev_slug: 'lt-realty',
      amenities: ['Infinity Pool', 'Gymnasium', 'Badminton Court', 'EV Charging', 'Senior Citizen Deck'],
      gallery: ['/images/tower-a.jpg', '/images/living-a.jpg'],
    },
    {
      title: 'Lakeside Forest-Front 3 BHK at Thane West',
      slug: 'thane-serenity-lakeside-forest-home',
      city: 'Thane',
      locality: 'Thane West',
      address: 'Serenity Lakeside, Off EE Highway, Thane West, Thane',
      description: 'Wake up to misty Upvan lake and Yeoor Hills greenery. Spacious 3 BHK apartment with large wrap-around deck, resort clubhouse, and seamless Eastern Express Highway access.',
      property_type: 'Apartment',
      listing_type: 'Buy',
      status: 'Under Construction',
      furnishing: 'Semi-Furnished',
      price: 21000000,
      price_per_sqft: 15555,
      area_sqft: 1350,
      carpet_note: '1,350 sq.ft carpet',
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      floor_no: '16',
      total_floors: 35,
      facing: 'North',
      parking: '2 Covered Spaces',
      possession_date: 'Dec 2027',
      rera_number: 'P51700008920',
      rera_approved: true,
      cover_image: '/images/thane-lake.jpg',
      featured: true,
      is_active: true,
      views: 260,
      project_slug: 'serenity-lakeside',
      dev_slug: 'kalpataru',
      amenities: ['Jogging Track', 'Yoga Pavilion', 'Clubhouse', 'Kids Play Area', 'Amphitheatre', 'Landscaped Gardens'],
      gallery: ['/images/thane-lake.jpg', '/images/living-b.jpg', '/images/bedroom-a.jpg'],
    },
    {
      title: 'Hillside Forest-Theme Retreat in Kharghar',
      slug: 'godrej-hills-retreat-kharghar',
      city: 'Navi Mumbai',
      locality: 'Kharghar',
      address: 'Godrej Hills Retreat, Sector 36, Kharghar Hills, Navi Mumbai',
      description: 'Nature-infused 2 BHK hillside haven with forest hiking trails, sky wellness pavilion, and uninterrupted greenery nestled adjacent to Kharghar Hills.',
      property_type: 'Apartment',
      listing_type: 'Buy',
      status: 'New Launch',
      furnishing: 'Unfurnished',
      price: 14500000,
      price_per_sqft: 15263,
      area_sqft: 950,
      carpet_note: '950 sq.ft RERA carpet',
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      floor_no: '12',
      total_floors: 30,
      facing: 'East',
      parking: '1 Covered Space',
      possession_date: 'Dec 2028',
      rera_number: 'P52000041289',
      rera_approved: true,
      cover_image: '/images/tower-b.jpg',
      featured: false,
      is_active: true,
      views: 140,
      project_slug: 'godrej-hills-retreat',
      dev_slug: 'godrej-properties',
      amenities: ['Swimming Pool', 'Clubhouse', 'EV Charging', 'Yoga Pavilion', 'Landscaped Gardens'],
      gallery: ['/images/tower-b.jpg', '/images/living-a.jpg'],
    },
    {
      title: 'Direct Transit-Connected 3 BHK Suite in Seawoods',
      slug: 'grand-central-seawoods-luxury-suite',
      city: 'Navi Mumbai',
      locality: 'Nerul',
      address: 'Grand Central Seawoods, Sector 40, Nerul, Navi Mumbai',
      description: 'The pinnacle of transit-oriented luxury living. Direct elevator access into Seawoods Railway Station and Nexus Seawoods Mall with rooftop fine dining and infinity pool.',
      property_type: 'Apartment',
      listing_type: 'Buy',
      status: 'Ready to Move',
      furnishing: 'Fully-Furnished',
      price: 34000000,
      price_per_sqft: 21250,
      area_sqft: 1600,
      carpet_note: '1,600 sq.ft carpet',
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      floor_no: '20',
      total_floors: 26,
      facing: 'North-East',
      parking: '2 Covered Spaces',
      possession_date: 'Ready to Move',
      rera_number: 'P52000009124',
      rera_approved: true,
      cover_image: '/images/tower-a.jpg',
      featured: false,
      is_active: true,
      views: 215,
      project_slug: 'grand-central-seawoods',
      dev_slug: 'oberoi-realty',
      amenities: ['Infinity Pool', 'Gymnasium', 'Covered Parking', 'Spa & Sauna', '24x7 Security'],
      gallery: ['/images/tower-a.jpg', '/images/living-b.jpg'],
    },
    {
      title: 'Riverfront Luxury 4 BHK Private Villa',
      slug: 'riverside-county-panvel-luxury-villa',
      city: 'Navi Mumbai',
      locality: 'Panvel',
      address: 'Riverside County, Near Gadi River, Old Panvel, Navi Mumbai',
      description: 'Exclusive independent riverfront villa on landscaped private grounds. Features private lawn, rooftop gazebo, bespoke interiors, and minutes from the upcoming international airport.',
      property_type: 'Villa',
      listing_type: 'Buy',
      status: 'Under Construction',
      furnishing: 'Semi-Furnished',
      price: 32000000,
      price_per_sqft: 9696,
      area_sqft: 3300,
      carpet_note: '3,300 sq.ft built-up area + 1,200 sq.ft private garden',
      bedrooms: 4,
      bathrooms: 5,
      balconies: 3,
      floor_no: 'Ground + 2',
      total_floors: 3,
      facing: 'East',
      parking: '3 Private Parking Slots',
      possession_date: 'Sep 2027',
      rera_number: 'P52000018765',
      rera_approved: true,
      cover_image: '/images/villa-a.jpg',
      featured: true,
      is_active: true,
      views: 310,
      project_slug: 'riverside-county',
      dev_slug: 'piramal-realty',
      amenities: ['Clubhouse', 'Swimming Pool', 'Pet Park', 'Landscaped Gardens', '24x7 Security'],
      gallery: ['/images/villa-a.jpg', '/images/living-a.jpg', '/images/bedroom-a.jpg'],
    },
    {
      title: 'Modern High-Tech 2 BHK Flat near Airport Corridor',
      slug: 'nexzone-aria-panvel-modern-flat',
      city: 'Navi Mumbai',
      locality: 'Panvel',
      address: 'Nexzone Aria, Palaspe Phata, NH 4, Panvel, Navi Mumbai',
      description: 'Smart 2 BHK in an integrated mega township on the airport highway corridor. High rental yield potential, sports complex, and school inside the campus.',
      property_type: 'Apartment',
      listing_type: 'Buy',
      status: 'Under Construction',
      furnishing: 'Unfurnished',
      price: 9500000,
      price_per_sqft: 11875,
      area_sqft: 800,
      carpet_note: '800 sq.ft RERA carpet',
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      floor_no: '11',
      total_floors: 25,
      facing: 'North',
      parking: '1 Covered Space',
      possession_date: 'Dec 2028',
      rera_number: 'P52000021980',
      rera_approved: true,
      cover_image: '/images/tower-b.jpg',
      featured: false,
      is_active: true,
      views: 95,
      project_slug: 'nexzone-aria',
      dev_slug: 'marathon-realty',
      amenities: ['EV Charging', 'Kids Play Area', 'Badminton Court', 'Clubhouse', 'Power Backup'],
      gallery: ['/images/tower-b.jpg', '/images/kitchen-a.jpg'],
    },
    {
      title: 'Scenic Yeoor Hills Skyline 3 BHK Residence',
      slug: 'ghodbunder-gateway-thane-hills-view',
      city: 'Thane',
      locality: 'Ghodbunder Road',
      address: 'Ghodbunder Gateway, Ghodbunder Road, Thane West, Thane',
      description: 'Forest-facing high-floor flat along Ghodbunder Road featuring panoramic Yeoor green sanctuary views, cross-ventilation, and rooftop sky lounge.',
      property_type: 'Apartment',
      listing_type: 'Buy',
      status: 'New Launch',
      furnishing: 'Unfurnished',
      price: 18500000,
      price_per_sqft: 15416,
      area_sqft: 1200,
      carpet_note: '1,200 sq.ft carpet',
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      floor_no: '22',
      total_floors: 34,
      facing: 'East',
      parking: '1 Covered Space',
      possession_date: 'Mar 2029',
      rera_number: 'P51700034912',
      rera_approved: true,
      cover_image: '/images/tower-c.jpg',
      featured: false,
      is_active: true,
      views: 115,
      project_slug: 'ghodbunder-gateway',
      dev_slug: 'wadhwa-group',
      amenities: ['Swimming Pool', 'Gymnasium', 'Power Backup', 'Landscaped Gardens', 'Rooftop Lounge'],
      gallery: ['/images/tower-c.jpg', '/images/living-a.jpg'],
    },
    {
      title: 'Child-Centric Luxury Township 3 BHK Suite',
      slug: 'urbania-crown-majiwada-thane-suite',
      city: 'Thane',
      locality: 'Majiwada',
      address: 'Urbania Crown, Majiwada Junction, Thane West, Thane',
      description: 'Ideal family residence at Majiwada junction featuring an internal international school, Olympic size pool, 55+ lifestyle amenities, and prime connectivity to Mumbai.',
      property_type: 'Apartment',
      listing_type: 'Buy',
      status: 'Ready to Move',
      furnishing: 'Semi-Furnished',
      price: 17500000,
      price_per_sqft: 15909,
      area_sqft: 1100,
      carpet_note: '1,100 sq.ft carpet',
      bedrooms: 3,
      bathrooms: 2,
      balconies: 1,
      floor_no: '15',
      total_floors: 32,
      facing: 'West',
      parking: '1 Covered Space',
      possession_date: 'Ready to Move',
      rera_number: 'P51700004510',
      rera_approved: true,
      cover_image: '/images/tower-a.jpg',
      featured: false,
      is_active: true,
      views: 172,
      project_slug: 'urbania-crown',
      dev_slug: 'rustomjee',
      amenities: ['Clubhouse', 'Kids Play Area', 'Swimming Pool', 'High-speed Lifts', '24x7 Security'],
      gallery: ['/images/tower-a.jpg', '/images/living-b.jpg', '/images/bedroom-a.jpg'],
    },
  ];

  // Fetch all amenities for linking
  const { data: allAmenities } = await supabase.from('amenities').select('id,name');
  const amenityMap = {};
  (allAmenities || []).forEach((a) => {
    amenityMap[a.name.toLowerCase()] = a.id;
  });

  for (const prop of PROPERTIES) {
    const { amenities, gallery, project_slug, dev_slug, ...propData } = prop;
    propData.project_id = projectMap[project_slug] || null;
    propData.developer_id = developerMap[dev_slug] || null;

    let propId;
    const { data: existingProp } = await supabase.from('properties').select('id').eq('slug', propData.slug).maybeSingle();
    if (existingProp) {
      propId = existingProp.id;
      await supabase.from('properties').update(propData).eq('id', propId);
    } else {
      const { data: newProp, error } = await supabase.from('properties').insert(propData).select('id').single();
      if (error) {
        console.error(`Error inserting property ${propData.title}:`, error);
        continue;
      }
      propId = newProp.id;
    }

    // Link amenities
    if (amenities && amenities.length > 0) {
      await supabase.from('property_amenities').delete().eq('property_id', propId);
      const rows = amenities
        .map((name) => amenityMap[name.toLowerCase()])
        .filter(Boolean)
        .map((amenity_id) => ({ property_id: propId, amenity_id }));
      if (rows.length > 0) {
        await supabase.from('property_amenities').insert(rows);
      }
    }

    // Link images
    if (gallery && gallery.length > 0) {
      await supabase.from('property_images').delete().eq('property_id', propId);
      const imgRows = gallery.map((image_url, i) => ({
        property_id: propId,
        image_url,
        sort_order: i,
        caption: `Gallery image ${i + 1}`,
      }));
      await supabase.from('property_images').insert(imgRows);
    }
  }

  console.log('Seeding Blog Posts...');
  const BLOGS = [
    {
      title: 'Navi Mumbai International Airport (NMIAL): Real Estate Impact on Kharghar, Panvel & Ulwe',
      slug: 'nmial-airport-impact-navi-mumbai-real-estate',
      excerpt: 'How the upcoming greenfield international airport and Atal Setu (MTHL) are reshaping capital values and rental yields across Navi Mumbai.',
      category: 'Market Insights',
      cover_image: '/images/hero-skyline.jpg',
      author: 'Primex Research Team',
      tags: 'Navi Mumbai, NMIAL, Kharghar, Investment',
      published: true,
      content: `The commissioning of Navi Mumbai International Airport marks the single largest structural inflection point for the Mumbai Metropolitan Region in decades. Infrastructure corridors connecting the airport via Atal Setu and the Kharghar-Turbhe tunnel have triggered widespread institutional capital inflows.

Key Micro-Market Takeaways:
1. Kharghar: High rental yield resilience driven by educational institutions and golf-course living.
2. Panvel: Emerging township hub with multimodal connectivity.
3. CBD Belapur: Commercial and administrative heartbeat benefiting from rapid South Mumbai transit.

Investors looking for capital appreciation of 12-15% over a 3-5 year horizon should evaluate RERA-approved grade-A townships along these transit vectors.`,
    },
    {
      title: 'Living on Palm Beach Road: The South Mumbai of Navi Mumbai',
      slug: 'palm-beach-road-luxury-living-guide',
      excerpt: 'An inside look at Palm Beach Road — why CXOs, industrialists and NRIs prefer sea-facing penthouses along this 10-kilometer golden stretch.',
      category: 'Lifestyle & Luxury',
      cover_image: '/images/tower-a.jpg',
      author: 'Rohan Khanna',
      tags: 'Palm Beach Road, Luxury, Vashi, Belapur',
      published: true,
      content: `Widely dubbed the Marine Drive of Navi Mumbai, Palm Beach Road is a picturesque 10 km corridor connecting Vashi to CBD Belapur along the Arabian Sea creek.

With strict coastal zoning and limited fresh supply, residences on Palm Beach Road command an enduring premium. Large 3 and 4 BHK layouts with private sundecks, unobstructed sunset views, and walk-to-work access make it the primary choice for discerning luxury buyers.`,
    },
    {
      title: 'Top 5 Lake & Forest-Facing Luxury Enclaves in Thane West',
      slug: 'top-luxury-enclaves-thane-west',
      excerpt: 'Discover the premier residential projects in Thane West overlooking Upvan Lake and the Yeoor Hills sanctuary.',
      category: 'Area Guide',
      cover_image: '/images/thane-lake.jpg',
      author: 'Primex Research Team',
      tags: 'Thane, Yeoor Hills, Upvan Lake, Luxury',
      published: true,
      content: `Thane West has evolved into an affluent self-contained luxury market. Away from congested city centers, Pokhran Road 2 and Ghodbunder Road offer clean air, Yeoor hill trails, and scenic lake vistas.

Projects like Serenity Lakeside and Ghodbunder Gateway present an ideal blend of nature and urban connectivity, with fast access to Viviana Mall, top international schools, and the Eastern Express Highway.`,
    },
  ];

  for (const b of BLOGS) {
    const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', b.slug).maybeSingle();
    if (!existing) {
      await supabase.from('blog_posts').insert(b);
    }
  }

  console.log('Seeding Testimonials...');
  const TESTIMONIALS = [
    {
      name: 'Anish & Sunita Mehta',
      locality: 'Kharghar, Navi Mumbai',
      rating: 5,
      content: 'Primex Properties guided us seamlessly from our first site visit to receiving keys for our 3 BHK golf-course residence in Kharghar. Transparent pricing and complete MahaRERA verification made the journey stress-free.',
      approved: true,
    },
    {
      name: 'Vikram Deshmukh',
      locality: 'Belapur, Navi Mumbai',
      rating: 5,
      content: 'Finding a sea-facing Palm Beach penthouse required local market expertise. The Primex team secured pre-launch pricing and negotiated favorable payment milestones.',
      approved: true,
    },
    {
      name: 'Pooja Kulkarni',
      locality: 'Vashi, Navi Mumbai',
      rating: 5,
      content: 'Extremely professional real estate advisors in Navi Mumbai. They gave honest valuation reports and managed all legal paperwork flawlessly for our Vashi resale flat.',
      approved: true,
    },
    {
      name: 'Siddharth Rao',
      locality: 'Worli, Mumbai',
      rating: 5,
      content: 'The sea link view from our Worli sky villa is unmatched. Primex provided end-to-end legal clearance, registration assistance, and white-glove brokerage service.',
      approved: true,
    },
  ];

  const { data: existingT } = await supabase.from('testimonials').select('id');
  if (!existingT || existingT.length === 0) {
    await supabase.from('testimonials').insert(TESTIMONIALS);
  }

  console.log('All seed data completed successfully!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
