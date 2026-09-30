import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Upload, X, Plus } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut, CITY_AREAS, PROPERTY_TYPES, STATUSES, LISTING_TYPES } from '../lib/api';
import { Card, inputCls, labelCls, btnPrimary, btnGhost } from './ui';

const EMPTY = {
  title: '', slug: '', description: '', property_type: 'Apartment', listing_type: 'Sale', status: 'Ready to Move',
  price: '', bedrooms: '2', bathrooms: '2', area_sqft: '', carpet_note: '', floor_no: '', total_floors: '',
  facing: '', furnishing: 'Unfurnished', parking: '1 Covered', possession_date: '', address: '', locality: '',
  city: 'Navi Mumbai', project_id: '', developer_id: '', cover_image: '', video_url: '', rera_approved: false,
  rera_number: '', featured: false, is_active: true,
};

const STOCK = ['/images/tower-a.jpg', '/images/tower-b.jpg', '/images/tower-c.jpg', '/images/living-a.jpg', '/images/living-b.jpg', '/images/bedroom-a.jpg', '/images/kitchen-a.jpg', '/images/bath-a.jpg', '/images/villa-a.jpg', '/images/penthouse-a.jpg', '/images/pool-a.jpg', '/images/lobby-a.jpg', '/images/hero-skyline.jpg', '/images/thane-lake.jpg'];

export default function PropertyForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, unknown>>(EMPTY);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [selAmen, setSelAmen] = useState<number[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [newImg, setNewImg] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showStock, setShowStock] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet('/api/amenities').catch(() => []),
      apiGet('/api/projects?limit=100').catch(() => ({ data: [] })),
      apiGet('/api/developers?limit=100').catch(() => ({ data: [] })),
    ]).then(([a, pr, dv]) => { setAmenities(a || []); setProjects(pr.data || []); setDevelopers(dv.data || []); });
    if (!isNew) {
      apiGet(`/api/properties?id=${id}`).then((d) => {
        const f: Record<string, unknown> = { ...EMPTY };
        Object.keys(EMPTY).forEach((k) => { if (d[k] !== undefined && d[k] !== null) f[k] = d[k]; });
        if (!f.locality && d.locality) f.locality = d.locality;
        setForm(f);
        setSelAmen((d.property_amenities || []).map((x: any) => x.amenities?.id).filter(Boolean));
        setGallery((d.property_images || []).slice().sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((x: any) => x.image_url));
      }).catch(() => setError('Failed to load listing.')).finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const upload = async (file: File, asCover: boolean) => {
    setUploading(true);
    setError('');
    try {
      const base64 = await fileToBase64(file);
      const r = await apiMut('/api/upload', 'POST', { fileName: file.name, fileBase64: base64, contentType: file.type, folder: 'properties' });
      if (asCover) set('cover_image', r.url);
      else setGallery((g) => [...g, r.url]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title) { setError('Title is required.'); return; }
    if (!form.price || Number(form.price) <= 0) { setError('Valid price is required.'); return; }
    setSaving(true);
    try {
      const num = (v: unknown) => (v === '' || v === null || v === undefined ? null : Number(v));
      const payload: Record<string, unknown> = {
        ...form,
        price: num(form.price), bedrooms: num(form.bedrooms), bathrooms: num(form.bathrooms),
        area_sqft: num(form.area_sqft), floor_no: form.floor_no === '' ? null : form.floor_no,
        total_floors: num(form.total_floors), project_id: form.project_id === '' ? null : form.project_id,
        developer_id: form.developer_id === '' ? null : form.developer_id,
        amenity_ids: selAmen, images: gallery,
      };
      if (!isNew) payload.id = Number(id);
      await apiMut('/api/properties', isNew ? 'POST' : 'PUT', payload);
      navigate('/admin/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-gold-dark" size={30} /></div>;

  const localities = form.city ? CITY_AREAS[String(form.city)] || [] : [];

  return (
    <div className="space-y-5 max-w-5xl">
      <SEO title={isNew ? 'Add Listing' : 'Edit Listing'} />
      <div className="flex items-center gap-4">
        <Link to="/admin/properties" className="p-2 border border-ink/15 hover:border-gold"><ArrowLeft size={17} /></Link>
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase">CMS · Inventory</div>
          <h1 className="font-serif text-ink text-3xl">{isNew ? 'Add Listing' : 'Edit Listing'}</h1>
        </div>
      </div>

      <form onSubmit={save} className="space-y-5">
        <Card className="p-5 lg:p-6 space-y-4">
          <h2 className="font-serif text-lg text-ink">Basics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2"><label className={labelCls}>Title *</label><input value={String(form.title)} onChange={(e) => set('title', e.target.value)} className={inputCls} placeholder="3 BHK Sky Residence in Palm Meadows, Kharghar" /></div>
            <div className="lg:col-span-2"><label className={labelCls}>URL slug (auto if blank)</label><input value={String(form.slug)} onChange={(e) => set('slug', e.target.value)} className={inputCls} placeholder="3-bhk-palm-meadows-kharghar" /></div>
            <div className="lg:col-span-2"><label className={labelCls}>Description</label><textarea value={String(form.description)} onChange={(e) => set('description', e.target.value)} rows={4} className={inputCls} /></div>
            <div><label className={labelCls}>Property type</label><select value={String(form.property_type)} onChange={(e) => set('property_type', e.target.value)} className={inputCls}>{PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className={labelCls}>Listing type</label><select value={String(form.listing_type)} onChange={(e) => set('listing_type', e.target.value)} className={inputCls}>{LISTING_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className={labelCls}>Status</label><select value={String(form.status)} onChange={(e) => set('status', e.target.value)} className={inputCls}>{STATUSES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className={labelCls}>Price (₹) *</label><input type="number" value={String(form.price)} onChange={(e) => set('price', e.target.value)} className={inputCls} placeholder="12500000" /></div>
            <div><label className={labelCls}>Bedrooms</label><input type="number" min={0} max={10} value={String(form.bedrooms)} onChange={(e) => set('bedrooms', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Bathrooms</label><input type="number" min={0} max={10} value={String(form.bathrooms)} onChange={(e) => set('bathrooms', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Area (sq.ft)</label><input type="number" value={String(form.area_sqft)} onChange={(e) => set('area_sqft', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Furnishing</label><select value={String(form.furnishing)} onChange={(e) => set('furnishing', e.target.value)} className={inputCls}>{['Unfurnished', 'Semi-Furnished', 'Fully Furnished'].map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className={labelCls}>Floor no</label><input value={String(form.floor_no)} onChange={(e) => set('floor_no', e.target.value)} className={inputCls} placeholder="14" /></div>
            <div><label className={labelCls}>Total floors</label><input type="number" value={String(form.total_floors)} onChange={(e) => set('total_floors', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Facing</label><input value={String(form.facing)} onChange={(e) => set('facing', e.target.value)} className={inputCls} placeholder="East / Park-facing" /></div>
            <div><label className={labelCls}>Parking</label><input value={String(form.parking)} onChange={(e) => set('parking', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Possession</label><input value={String(form.possession_date)} onChange={(e) => set('possession_date', e.target.value)} className={inputCls} placeholder="Dec 2027 / Ready" /></div>
            <div><label className={labelCls}>Video URL</label><input value={String(form.video_url)} onChange={(e) => set('video_url', e.target.value)} className={inputCls} placeholder="https://…" /></div>
          </div>
        </Card>

        <Card className="p-5 lg:p-6 space-y-4">
          <h2 className="font-serif text-lg text-ink">Location & Links</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div><label className={labelCls}>City</label><select value={String(form.city)} onChange={(e) => { set('city', e.target.value); set('locality', ''); }} className={inputCls}>{Object.keys(CITY_AREAS).map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className={labelCls}>Locality</label><select value={String(form.locality)} onChange={(e) => set('locality', e.target.value)} className={inputCls}><option value="">Select…</option>{localities.map((l) => <option key={l}>{l}</option>)}</select></div>
            <div><label className={labelCls}>Address</label><input value={String(form.address)} onChange={(e) => set('address', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Project</label><select value={String(form.project_id)} onChange={(e) => set('project_id', e.target.value)} className={inputCls}><option value="">None</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.locality}</option>)}</select></div>
            <div><label className={labelCls}>Developer</label><select value={String(form.developer_id)} onChange={(e) => set('developer_id', e.target.value)} className={inputCls}><option value="">None</option>{developers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          </div>
        </Card>

        <Card className="p-5 lg:p-6 space-y-4">
          <h2 className="font-serif text-lg text-ink">RERA & Visibility</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 border border-ink/15 px-3.5 py-2.5 text-sm cursor-pointer"><input type="checkbox" checked={!!form.rera_approved} onChange={(e) => set('rera_approved', e.target.checked)} className="accent-[#b98a2f] w-4 h-4" /> RERA approved</label>
            <div className="lg:col-span-2"><input value={String(form.rera_number)} onChange={(e) => set('rera_number', e.target.value)} className={inputCls} placeholder="RERA number (e.g. P52000012345)" /></div>
            <div className="flex gap-4 items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!form.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-[#b98a2f] w-4 h-4" /> Featured</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="accent-[#b98a2f] w-4 h-4" /> Live</label>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink">Amenities</h2>
            <span className="text-xs text-ink/45">{selAmen.length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <button type="button" key={a.id} onClick={() => setSelAmen((s) => s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id])} className={`px-3 py-1.5 text-xs border transition ${selAmen.includes(a.id) ? 'bg-ink text-gold border-ink' : 'border-ink/15 text-ink/60 hover:border-gold'}`}>{a.name}</button>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:p-6 space-y-4">
          <h2 className="font-serif text-lg text-ink">Media</h2>
          <div>
            <label className={labelCls}>Cover image</label>
            <div className="flex flex-col sm:flex-row gap-3">
              {form.cover_image ? <img src={String(form.cover_image)} alt="" className="w-40 h-28 object-cover border border-ink/10" /> : <div className="w-40 h-28 bg-cream border border-ink/10 flex items-center justify-center text-xs text-ink/40">No cover</div>}
              <div className="flex-1 space-y-2">
                <input value={String(form.cover_image)} onChange={(e) => set('cover_image', e.target.value)} className={inputCls} placeholder="Paste image URL…" />
                <div className="flex flex-wrap gap-2">
                  <label className={`${btnGhost} cursor-pointer inline-flex items-center gap-2`}>
                    <Upload size={13} /> {uploading ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, true); e.target.value = ''; }} />
                  </label>
                  <button type="button" onClick={() => setShowStock(!showStock)} className={btnGhost}>Stock library</button>
                </div>
              </div>
            </div>
            {showStock && (
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-3">
                {STOCK.map((s) => (
                  <button type="button" key={s} onClick={() => { set('cover_image', s); setShowStock(false); }} className={`border-2 overflow-hidden ${form.cover_image === s ? 'border-gold' : 'border-transparent'}`}>
                    <img src={s} alt="" className="w-full h-14 object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>Gallery ({gallery.length})</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {gallery.map((g, i) => (
                <div key={i} className="relative group">
                  <img src={g} alt="" className="w-full h-20 object-cover border border-ink/10" loading="lazy" />
                  <button type="button" onClick={() => setGallery(gallery.filter((_, x) => x !== i))} className="absolute top-1 right-1 bg-ink/80 text-white p-1 opacity-0 group-hover:opacity-100 transition"><X size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input value={newImg} onChange={(e) => setNewImg(e.target.value)} className={inputCls} placeholder="Paste image URL and add…" />
              <button type="button" onClick={() => { if (newImg.trim()) { setGallery([...gallery, newImg.trim()]); setNewImg(''); } }} className={btnGhost}><Plus size={15} /></button>
              <label className={`${btnGhost} cursor-pointer inline-flex items-center gap-2`}>
                <Upload size={13} /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, false); e.target.value = ''; }} />
              </label>
            </div>
          </div>
        </Card>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4">{error}</div>}

        <div className="flex gap-3 sticky bottom-4">
          <button disabled={saving} className={btnPrimary + ' !px-8 !py-3.5 flex items-center gap-2'}>{saving && <Loader2 size={15} className="animate-spin" />} {saving ? 'Saving…' : isNew ? 'Publish Listing' : 'Save Changes'}</button>
          <Link to="/admin/properties" className={btnGhost + ' !px-8 !py-3.5'}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
