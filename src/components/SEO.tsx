import { useEffect } from 'react';

interface Props {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
  schema?: object;
}

export default function SEO({ title, description, keywords, image, canonical, schema }: Props) {
  const full = title.includes('Primex') ? title : `${title} | Primex Properties`;
  const desc = description || 'Primex Properties — premium homes across Mumbai, Navi Mumbai & Thane. Explore the best properties in Kharghar, Belapur, Vashi, Nerul & Thane West with verified MahaRERA listings.';
  const img = image || '/images/hero-skyline.jpg';
  const url = canonical || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    document.title = full;
    const set = (sel: string, attr: string, val: string, tag = 'meta') => {
      let el = document.head.querySelector(sel) as HTMLElement | null;
      if (!el) {
        el = document.createElement(tag);
        const m = sel.match(/\[(name|property)="([^"]+)"\]/);
        if (m) el.setAttribute(m[1], m[2]);
        else if (sel === 'link[rel="canonical"]') el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };
    set('meta[name="description"]', 'content', desc);
    if (keywords) set('meta[name="keywords"]', 'content', keywords);
    set('meta[property="og:title"]', 'content', full);
    set('meta[property="og:description"]', 'content', desc);
    set('meta[property="og:image"]', 'content', img);
    set('meta[property="og:url"]', 'content', url);
    set('meta[property="og:type"]', 'content', 'website');
    set('meta[name="twitter:card"]', 'content', 'summary_large_image');
    set('meta[name="twitter:title"]', 'content', full);
    set('meta[name="twitter:description"]', 'content', desc);
    set('meta[name="twitter:image"]', 'content', img);
    set('link[rel="canonical"]', 'href', url, 'link');
    const old = document.head.querySelector('script[data-seo-schema]');
    if (old) old.remove();
    if (schema) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-schema', '1');
      s.textContent = JSON.stringify(schema);
      document.head.appendChild(s);
    }
  }, [full, desc, keywords, img, url]);

  return null;
}

export function realEstateSchema(props: { name: string; description: string; url: string; image?: string; price?: number; locality?: string; city?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: props.name,
    description: props.description,
    url: props.url,
    image: props.image,
    address: { '@type': 'PostalAddress', addressLocality: props.locality, addressRegion: 'Maharashtra', addressCountry: 'IN' },
    ...(props.price ? { offers: { '@type': 'Offer', price: props.price, priceCurrency: 'INR' } } : {}),
  };
}
