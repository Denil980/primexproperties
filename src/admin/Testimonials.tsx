import { useEffect, useState } from 'react';
import { Loader2, Trash2, Check, Star, Plus, Pencil, X, MessageSquareQuote, MapPin, User, Quote } from 'lucide-react';
import SEO from '../components/SEO';
import { apiGet, apiMut, timeAgo } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { Card, CardHead, Empty, btnGhost, btnPrimary, inputCls, labelCls } from './ui';

interface TestimonialItem {
  id?: number;
  name: string;
  locality: string;
  rating: number;
  content: string;
  approved: boolean;
  created_at?: string;
}

const EMPTY_FORM: TestimonialItem = {
  name: '',
  locality: '',
  rating: 5,
  content: '',
  approved: true,
};

export default function AdminTestimonials() {
  const { isAdmin } = useAuth();
  const { showConfirm, showAlert } = useModal();
  
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  // Modal & Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TestimonialItem>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    const q = filter ? `?approved=${filter}` : '';
    apiGet(`/api/testimonials${q}`)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAddForm = () => {
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (item: TestimonialItem) => {
    setFormData({
      id: item.id,
      name: item.name || '',
      locality: item.locality || '',
      rating: item.rating || 5,
      content: item.content || '',
      approved: !!item.approved,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.content.trim()) {
      setFormError('User review content is required.');
      return;
    }
    if (!formData.name.trim()) {
      setFormError("User's name is required.");
      return;
    }
    if (!formData.locality.trim()) {
      setFormError('Location is required.');
      return;
    }

    setSaving(true);
    try {
      if (formData.id) {
        // Update existing testimonial
        await apiMut('/api/testimonials', 'PUT', formData);
        await showAlert('Testimonial updated successfully.', 'Updated', 'success');
      } else {
        // Add new testimonial
        await apiMut('/api/testimonials', 'POST', formData);
        await showAlert('New testimonial added successfully and published.', 'Saved', 'success');
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const approve = async (t: TestimonialItem) => {
    try {
      await apiMut('/api/testimonials', 'PUT', { id: t.id, approved: !t.approved });
      load();
    } catch (err: any) {
      await showAlert(err.message || 'Action failed', 'Error');
    }
  };

  const remove = async (id: number) => {
    const ok = await showConfirm('Are you sure you want to delete this testimonial?', 'Delete Testimonial', true);
    if (!ok) return;
    try {
      await apiMut('/api/testimonials', 'DELETE', { id });
      await showAlert('Testimonial deleted.', 'Deleted', 'success');
      load();
    } catch (err: any) {
      await showAlert(err.message || 'Failed to delete', 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Testimonials — Admin Panel" />

      {/* Header & Add Testimonials Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-gold-dark text-[11px] tracking-[0.3em] uppercase font-medium">CMS · Social Proof</div>
          <h1 className="font-serif text-ink text-3xl mt-0.5">Testimonials</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filters */}
          <div className="flex gap-1.5 bg-ink/5 p-1 border border-ink/10">
            {[
              ['', 'All'],
              ['true', 'Approved'],
              ['false', 'Pending'],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`px-3.5 py-1.5 text-xs tracking-[0.15em] uppercase transition ${
                  filter === v ? 'bg-ink text-gold font-medium' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Add Testimonials Button */}
          <button
            onClick={openAddForm}
            className="bg-gold text-ink px-5 py-2.5 text-xs tracking-[0.18em] uppercase font-semibold hover:bg-ink hover:text-gold transition flex items-center gap-2 border border-gold shadow-sm"
          >
            <Plus size={16} /> Add Testimonials
          </button>
        </div>
      </div>

      {/* Main Card with Columns Table */}
      <Card>
        <CardHead
          title="Client Stories & Reviews"
          sub="Manage user reviews, user's names, and locations. Approved reviews reflect directly on the website homepage."
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-gold-dark" size={28} />
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center text-ink/45 text-sm">
            No testimonials found. Click <strong className="text-ink">"Add Testimonials"</strong> above to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink/10 text-[11px] tracking-[0.18em] uppercase text-ink/45 bg-ink/5">
                  <th className="px-5 py-3.5 font-normal w-5/12">User Review</th>
                  <th className="px-5 py-3.5 font-normal w-2/12">User's Name</th>
                  <th className="px-5 py-3.5 font-normal w-2/12">Location</th>
                  <th className="px-5 py-3.5 font-normal w-1.5/12">Rating & Date</th>
                  <th className="px-5 py-3.5 font-normal text-right w-1.5/12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 text-sm">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-ink/[0.02] transition">
                    {/* Column 1: User Review */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-start gap-2.5">
                        <Quote size={16} className="text-gold-dark shrink-0 mt-1 opacity-60" />
                        <p className="text-ink/80 leading-relaxed font-light italic text-sm">
                          "{t.content}"
                        </p>
                      </div>
                    </td>

                    {/* Column 2: User's Name */}
                    <td className="px-5 py-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gold-dark shrink-0" />
                        <span className="font-medium text-ink">{t.name}</span>
                      </div>
                    </td>

                    {/* Column 3: Location */}
                    <td className="px-5 py-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-2 text-ink/70">
                        <MapPin size={14} className="text-gold-dark shrink-0" />
                        <span className="font-light">{t.locality || 'Navi Mumbai'}</span>
                      </div>
                    </td>

                    {/* Column 4: Rating & Date */}
                    <td className="px-5 py-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gold-dark text-xs font-semibold">
                        <Star size={13} fill="currentColor" />
                        <span>{t.rating} / 5</span>
                      </div>
                      <div className="text-[11px] text-ink/40 mt-1">
                        {t.created_at ? timeAgo(t.created_at) : 'Recently'}
                      </div>
                    </td>

                    {/* Column 5: Actions */}
                    <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status pill */}
                        <span
                          className={`text-[10px] tracking-wider uppercase px-2.5 py-1 border font-medium ${
                            t.approved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {t.approved ? 'Live' : 'Pending'}
                        </span>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditForm(t)}
                          className={btnGhost + ' !py-1 !px-2.5 flex items-center gap-1 text-ink/70 hover:text-gold-dark'}
                          title="Edit Testimonial"
                        >
                          <Pencil size={13} /> Edit
                        </button>

                        {/* Approve/Unpublish Toggle */}
                        <button
                          onClick={() => approve(t)}
                          className={btnGhost + ' !py-1 !px-2.5 flex items-center gap-1'}
                        >
                          <Check size={13} /> {t.approved ? 'Unpublish' : 'Approve'}
                        </button>

                        {/* Delete Button */}
                        {isAdmin && t.id && (
                          <button
                            onClick={() => remove(t.id!)}
                            className="p-1.5 text-ink/40 hover:text-red-600 transition"
                            title="Delete Testimonial"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Testimonial Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-ink/20 w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-ink text-white px-6 py-4 flex items-center justify-between border-b border-gold/30">
              <div className="flex items-center gap-2.5">
                <MessageSquareQuote size={20} className="text-gold" />
                <h3 className="font-serif text-lg text-white">
                  {formData.id ? 'Edit Testimonial' : 'Add Testimonial'}
                </h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-white/60 hover:text-gold transition p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 text-xs">
                  {formError}
                </div>
              )}

              {/* User Review Column Input */}
              <div>
                <label className={labelCls}>User Review (Testimonial Quote) *</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the client's detailed review or story..."
                  className={inputCls}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* User's Name */}
                <div>
                  <label className={labelCls}>User's Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className={inputCls}
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className={labelCls}>Location *</label>
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="e.g. Kharghar, Navi Mumbai"
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                {/* Star Rating */}
                <div>
                  <label className={labelCls}>Rating (Stars)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className={inputCls}
                  >
                    <option value={5}>5 Stars ★★★★★ (Excellent)</option>
                    <option value={4}>4 Stars ★★★★☆ (Good)</option>
                    <option value={3}>3 Stars ★★★☆☆ (Average)</option>
                    <option value={2}>2 Stars ★★☆☆☆ (Fair)</option>
                    <option value={1}>1 Star ★☆☆☆☆ (Poor)</option>
                  </select>
                </div>

                {/* Publish Checkbox */}
                <div className="pt-5">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-ink select-none">
                    <input
                      type="checkbox"
                      checked={formData.approved}
                      onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                      className="w-4 h-4 accent-gold"
                    />
                    <span className="font-medium">Publish on Website (Live)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-ink/10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={btnGhost}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={btnPrimary + ' flex items-center gap-2'}
                >
                  {saving && <Loader2 size={14} className="animate-spin text-gold" />}
                  {formData.id ? 'Update Testimonial' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
