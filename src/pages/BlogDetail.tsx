import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Loader2, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import LeadFormModal from '../components/LeadFormModal';
import { apiGet, timeAgo } from '../lib/api';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [more, setMore] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadOpen, setLeadOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiGet(`/api/blog?slug=${encodeURIComponent(slug)}`)
      .then((d) => {
        setPost(d);
        apiGet('/api/blog?published=true&limit=4').then((r) => setMore((r || []).filter((x: any) => x.slug !== slug).slice(0, 3))).catch(() => {});
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="animate-spin text-gold-dark" size={32} /></div>;
  if (!post) return <div className="min-h-screen bg-cream flex flex-col items-center justify-center"><SEO title="Article not found" /><div className="font-serif text-3xl text-ink">Article not found</div><Link to="/blog" className="mt-5 bg-ink text-gold px-8 py-3 text-sm tracking-[0.18em] uppercase">All articles</Link></div>;

  return (
    <div className="bg-cream min-h-screen">
      <SEO title={post.title} description={post.excerpt || post.title} keywords={post.tags} image={post.cover_image} />
      <div className="relative h-[46vh] min-h-[340px]">
        <img src={post.cover_image || '/images/living-a.jpg'} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/25" />
        <div className="absolute inset-x-0 bottom-0 max-w-4xl mx-auto px-5 pb-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-gold text-xs tracking-[0.2em] uppercase mb-4"><ArrowLeft size={14} /> All articles</Link>
          <div className="text-gold text-[10px] tracking-[0.3em] uppercase">{post.category}</div>
          <h1 className="font-serif text-white text-2xl lg:text-5xl mt-2 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-2 mt-3 text-white/50 text-xs"><CalendarDays size={13} /> {timeAgo(post.created_at)} · {post.author || 'Primex Research'}</div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-5 py-10">
        <article className="bg-white border border-ink/10 p-6 lg:p-12">
          <p className="font-serif text-xl text-ink/80 italic leading-relaxed">{post.excerpt}</p>
          <div className="mt-6 text-ink/70 leading-[1.9] font-light whitespace-pre-line">{post.content}</div>
          {post.tags && <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-ink/10">{String(post.tags).split(',').map((t: string) => <span key={t} className="text-xs bg-cream border border-ink/10 px-3 py-1 text-ink/60">{t.trim()}</span>)}</div>}
        </article>
        <div className="bg-ink text-white p-8 mt-8 text-center">
          <h3 className="font-serif text-2xl">Thinking of buying in MMR?</h3>
          <p className="text-white/55 text-sm mt-2">Get a free 1:1 strategy call with a Primex senior advisor.</p>
          <button onClick={() => setLeadOpen(true)} className="mt-5 bg-gold text-ink px-8 py-3 text-sm tracking-[0.18em] uppercase font-semibold hover:bg-white transition">Book Free Call</button>
        </div>
        {more.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif text-ink text-2xl mb-5">Keep reading</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {more.map((b: any) => (
                <Link key={b.id} to={`/blog/${b.slug}`} className="group bg-white border border-ink/10 hover:border-gold/60 transition overflow-hidden">
                  <div className="aspect-[16/9] overflow-hidden"><img src={b.cover_image || '/images/living-b.jpg'} alt={b.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
                  <div className="p-4">
                    <div className="text-[10px] tracking-[0.3em] uppercase text-gold-dark">{b.category}</div>
                    <h3 className="font-serif text-base text-ink mt-1.5 line-clamp-2 group-hover:text-gold-dark transition">{b.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <Link to="/blog" className="inline-flex items-center gap-2 mt-8 text-sm tracking-[0.15em] uppercase text-ink/70 hover:text-gold-dark">All articles <ArrowRight size={15} /></Link>
      </div>
      <LeadFormModal open={leadOpen} onClose={() => setLeadOpen(false)} title="Book Your Free Strategy Call" />
    </div>
  );
}
