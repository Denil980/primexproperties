import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, CalendarDays } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, timeAgo } from '../lib/api';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('');

  useEffect(() => {
    setLoading(true);
    const q = cat ? `&category=${encodeURIComponent(cat)}` : '';
    apiGet(`/api/blog?published=true&limit=30${q}`).then(setPosts).catch(() => setPosts([])).finally(() => setLoading(false));
  }, [cat]);

  const cats = ['Market Trends', 'Guides', 'Investment', 'RERA & Legal', 'Lifestyle'];

  return (
    <div className="bg-cream min-h-screen">
      <SEO title="Real Estate Insights — MMR Market Trends, Guides & RERA Updates" description="Primex Insights: price trends for Kharghar, Belapur, Vashi & Thane, home-buying guides, RERA explainers and investment strategy for Mumbai real estate." />
      <div className="bg-ink pt-32 lg:pt-40 pb-12 px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-gold text-[11px] tracking-[0.35em] uppercase">Primex Insights</div>
          <h1 className="font-serif text-white text-3xl lg:text-5xl mt-2">Market Intelligence</h1>
          <div className="flex flex-wrap gap-2 mt-6">
            <button onClick={() => setCat('')} className={`px-4 py-2 text-xs tracking-[0.15em] uppercase border transition ${!cat ? 'bg-gold text-ink border-gold font-semibold' : 'border-white/20 text-white/70 hover:border-gold'}`}>All</button>
            {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 text-xs tracking-[0.15em] uppercase border transition ${cat === c ? 'bg-gold text-ink border-gold font-semibold' : 'border-white/20 text-white/70 hover:border-gold'}`}>{c}</button>)}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12">
        {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-dark" size={32} /></div> : posts.length === 0 ? (
          <div className="bg-white border border-ink/10 p-14 text-center font-serif text-xl">No articles yet in this category.</div>
        ) : (
          <>
            <Link to={`/blog/${posts[0].slug}`} className="group grid grid-cols-1 lg:grid-cols-2 bg-white border border-ink/10 hover:border-gold/60 transition overflow-hidden mb-8">
              <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                <img src={posts[0].cover_image || '/images/living-a.jpg'} alt={posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="text-[10px] tracking-[0.3em] uppercase text-gold-dark">{posts[0].category}</div>
                <h2 className="font-serif text-ink text-2xl lg:text-4xl mt-3 leading-tight group-hover:text-gold-dark transition">{posts[0].title}</h2>
                <p className="text-ink/55 mt-4 font-light line-clamp-3">{posts[0].excerpt}</p>
                <div className="flex items-center gap-2 mt-5 text-ink/45 text-xs"><CalendarDays size={13} /> {timeAgo(posts[0].created_at)} · {posts[0].author || 'Primex Research'}</div>
              </div>
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(1).map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.07 }}>
                  <Link to={`/blog/${b.slug}`} className="group block bg-white border border-ink/10 hover:border-gold/60 hover:shadow-xl transition overflow-hidden h-full">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={b.cover_image || '/images/living-b.jpg'} alt={b.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-6">
                      <div className="text-[10px] tracking-[0.3em] uppercase text-gold-dark">{b.category}</div>
                      <h3 className="font-serif text-xl text-ink mt-2 leading-snug group-hover:text-gold-dark transition line-clamp-2">{b.title}</h3>
                      <p className="text-ink/50 text-sm mt-2 line-clamp-2 font-light">{b.excerpt}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-ink/40 text-xs">{timeAgo(b.created_at)}</span>
                        <span className="inline-flex items-center gap-1 text-xs tracking-[0.18em] uppercase group-hover:gap-2.5 transition-all">Read <ArrowRight size={13} /></span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
