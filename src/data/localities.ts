export interface Locality {
  slug: string;
  name: string;
  city: string;
  tagline: string;
  image: string;
  avgPrice: string;
  priceRange: string;
  rentalYield: string;
  connectivity: string[];
  highlights: string[];
  intro: string[];
  faqs: { q: string; a: string }[];
}

export const LOCALITIES: Locality[] = [
  {
    slug: 'kharghar',
    name: 'Kharghar',
    city: 'Navi Mumbai',
    tagline: 'Best properties in Kharghar — Navi Mumbai\'s greenest, best-planned node',
    image: '/images/tower-c.jpg',
    avgPrice: '₹11,200 / sq.ft',
    priceRange: '₹75 L – ₹2.4 Cr',
    rentalYield: '3.6 – 4.1%',
    connectivity: ['Kharghar & Mansarovar railway stations (Harbour line)', 'Sion–Panvel Expressway & Mumbai–Pune Expressway access', 'Upcoming Navi Mumbai International Airport (20 min)', 'Kharghar–Turbhe Tunnel Rd & Metro Line 1 connectivity'],
    highlights: ['Central Park & Kharghar Hills golf course greens', 'Top schools: Ryan, Vibgyor, DY Patil University', 'Little World & Glomax malls + high-street retail', 'CIDCO-planned sectors with wide roads & gardens'],
    intro: [
      'Kharghar is widely regarded as Navi Mumbai\'s most liveable node — a CIDCO-planned township wrapped around Central Park, the Kharghar Hills and an 18-hole golf course. For families seeking the best properties in Kharghar, the micro-market offers everything from efficient 1 BHKs near the station to sprawling 3 BHK sky-villas in Sector 35–36.',
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
    avgPrice: '₹14,800 / sq.ft',
    priceRange: '₹1.1 Cr – ₹4.2 Cr',
    rentalYield: '3.4 – 3.9%',
    connectivity: ['CBD Belapur railway + upcoming Metro Line 1 interchange', 'Palm Beach Road & Sion–Panvel Expressway', 'Atal Setu (MTHL) — South Mumbai in ~40 min', 'Nerul–Uran line & airport link via Ulwe'],
    highlights: ['Navi Mumbai\'s administrative & corporate capital', 'Wonders Park, Parsik Hills treks & Belapur Jetty', 'Inorbit, Raghuleela & premium high-street dining', 'Top schools: DPS Nerul, Apeejay, Goldcrest nearby'],
    intro: [
      'CBD Belapur is Navi Mumbai\'s beating heart — home to RBI, Konkan Bhavan, top PSUs and a fast-growing corporate corridor along Palm Beach Road. Buyers searching for the best properties in Belapur are typically CXOs, bankers and NRI investors who value walk-to-work convenience and sea-facing Palm Beach frontage.',
      'The micro-market skews premium: 2.5–4 BHK residences in Sectors 11, 15 and 20, plus luxury towers along Palm Beach Road with creek views. The Atal Setu sea bridge has structurally repriced Belapur — South Mumbai is now a 40-minute drive, and corporate leasing demand keeps vacancy near zero.',
      'Primex holds preferred allotments across Belapur\'s top RERA-approved towers, including pre-launch inventory in Sector 15 and resale mandates on Palm Beach Road.',
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
    tagline: 'Best properties in Vashi — MMR\'s most connected address',
    image: '/images/hero-skyline.jpg',
    avgPrice: '₹16,400 / sq.ft',
    priceRange: '₹1.3 Cr – ₹5 Cr',
    rentalYield: '3.2 – 3.7%',
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
    avgPrice: '₹13,600 / sq.ft',
    priceRange: '₹95 L – ₹3.2 Cr',
    rentalYield: '3.5 – 4.0%',
    connectivity: ['Nerul railway (Harbour + Trans-Harbour + Uran link)', 'Palm Beach Road — 10 min to Vashi & Belapur', 'Seawoods Grand Central & Nexus Mall district', 'Upcoming airport connectivity via Ulwe'],
    highlights: ['Seawoods Grand Central — MMR\'s largest mall', 'Wonders Park & Rock Garden family zones', 'DY Patil Stadium events district', 'Premium schools: DPS, Goldcrest, Ryan'],
    intro: [
      'Nerul sits perfectly between Vashi and Belapur on Palm Beach Road, offering CBD access without CBD prices. Flats in Nerul attract young families and first-time luxury buyers — particularly in Sectors 28, 44, 46 and the Seawoods estate with its Grand Central mall integration.',
      'The Seawoods–Nerul corridor has seen the sharpest infrastructure-led appreciation in Navi Mumbai, with Palm Beach frontage towers commanding Belapur-like premiums. Trans-Harbour connectivity to Thane adds a second employment catchment.',
      'Primex lists RERA-verified new launches and resales across Nerul, with particular depth in Seawoods and Sector 44–48 family clusters.',
    ],
    faqs: [
      { q: 'What do 2 BHK flats cost in Nerul?', a: 'A 2 BHK in Nerul ranges ₹95 L–₹1.5 Cr depending on sector; Seawoods-fronting towers trade at a 15–20% premium.' },
      { q: 'Is Nerul or Kharghar better?', a: 'Nerul offers superior connectivity and retail; Kharghar offers greener surroundings and lower entry prices. Investors often hold both.' },
      { q: 'How is Nerul connected to Thane?', a: 'Directly via the Trans-Harbour line (Thane–Nerul) and by road through Airoli — typically 30–40 minutes.' },
    ],
  },
  {
    slug: 'thane-west',
    name: 'Thane West',
    city: 'Thane',
    tagline: 'Flats in Thane West — the lake city\'s luxury corridor',
    image: '/images/thane-lake.jpg',
    avgPrice: '₹13,900 / sq.ft',
    priceRange: '₹85 L – ₹3.8 Cr',
    rentalYield: '3.4 – 3.9%',
    connectivity: ['Thane railway (Central + Trans-Harbour) + Metro Line 4', 'Eastern Express Highway & Ghodbunder Road', 'Upcoming Borivali–Thane tunnel & coastal road links', '45 min to BKC via EEH; 30 min to Airoli IT corridor'],
    highlights: ['Upvan & Masunda lakes + Yeoor Hills greens', 'Viviana & Korum malls + Ghodbunder high-street', 'Top schools: Singhania, Hiranandani, DAV', 'Hiranandani Estate & lake-facing luxury clusters'],
    intro: [
      'Thane West has completed its transformation from Mumbai\'s suburb to a self-sufficient luxury market. Flats in Thane West — particularly around Pokhran Road, Hiranandani Estate and Ghodbunder Road — now rival Powai on specifications while offering larger carpet areas per rupee.',
      'The Metro Line 4 corridor, the upcoming Borivali tunnel and sustained IT/office absorption along Ghodbunder Road underpin both end-user and investor demand. Lake-facing inventory in premium towers carries a durable 20–30% premium.',
      'Primex curates lake-facing and high-floor inventory across Thane West\'s top RERA-approved developments, with full diligence on title and approvals.',
    ],
    faqs: [
      { q: 'What is the average flat price in Thane West?', a: 'Thane West averages ₹12,500–₹15,500 per sq.ft in 2026. Ghodbunder Road offers value at ₹11,000–₹13,000; Pokhran lake-facing towers reach ₹16,000–₹19,000.' },
      { q: 'Is Thane West good for investment?', a: 'Yes — metro-led connectivity, IT corridor growth and relative affordability vs Mumbai drive consistent 7–10% annual appreciation.' },
      { q: 'Which areas are best in Thane West?', a: 'Pokhran Road 2 (lake-facing luxury), Hiranandani Estate (integrated township) and Majiwada–Kolshet (value + metro access).' },
    ],
  },
  {
    slug: 'powai',
    name: 'Powai',
    city: 'Mumbai',
    tagline: 'Luxury homes in Powai — Mumbai\'s lake-and-legacy district',
    image: '/images/lobby-a.jpg',
    avgPrice: '₹24,500 / sq.ft',
    priceRange: '₹1.8 Cr – ₹9 Cr',
    rentalYield: '2.8 – 3.3%',
    connectivity: ['JVLR & Eastern Express Highway access', 'Upcoming Metro Line 6 (Swami Samarth Nagar–Vikhroli)', '20 min to BKC; 30 min to airport', 'Powai–Vihar lake promenades & IIT Bombay campus'],
    highlights: ['Powai Lake views & Hiranandani Gardens legacy', 'IIT Bombay & top international schools', 'Galleries, breweries & fine-dining high-street', 'Deep corporate & expat rental catchment'],
    intro: [
      'Powai is Mumbai\'s definitive live-work-play district — where IIT Bombay, global capability centres and Hiranandani Gardens\' European streetscapes meet Powai Lake\'s serenity. Luxury homes in Powai command the strongest premiums in the central suburbs, with lake-facing towers achieving Powai–Chandivali\'s highest per-square-foot values.',
      'The buyer profile is senior tech leadership, founders and returning NRIs. Rental demand from expats and CXOs is the deepest in Mumbai\'s suburbs, supporting trophy-asset pricing even in soft cycles.',
      'Primex advises on Powai\'s lake-facing towers, Hiranandani resale mandates and select Chandivali value opportunities.',
    ],
    faqs: [
      { q: 'What do luxury flats cost in Powai?', a: 'Powai averages ₹22,000–₹28,000 per sq.ft. Lake-facing 3 BHKs range ₹3.5–₹6 Cr; Hiranandani Gardens commands sustained premiums.' },
      { q: 'Is Powai well connected?', a: 'Yes — JVLR links the Western and Eastern Express Highways, Metro Line 6 is under construction, and BKC is 20 minutes off-peak.' },
      { q: 'Why is Powai expensive?', a: 'Scarcity (lake + IIT + hills constrain supply), high-income employment catchment and legacy township premiums combine to support values.' },
    ],
  },
];

export function getLocality(slug: string | undefined) {
  return LOCALITIES.find((l) => l.slug === slug);
}
