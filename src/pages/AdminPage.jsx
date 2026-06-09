import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, Globe, Brain, BookOpen, Library, FileText,
  Beaker, MessageSquare, Upload, TrendingUp, Shield, ArrowLeft,
  Menu, X, Trash2, RefreshCw, Check, ExternalLink, Activity,
  Plus, Edit2, Save, XCircle, Pin,
  Star, Hash, ShoppingCart, Download, AlertTriangle, DollarSign,
} from 'lucide-react';
import {
  adminAPI, coursesAPI, googleAPI, booksAPI, essaysAPI,
  processesAPI, communityAPI, storiesAPI, modulesAPI, marketplaceAPI,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import FileUploader from '../components/FileUploader';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',   label: 'Overview',             icon: BarChart3     },
  { id: 'citizens',   label: 'Citizens',             icon: Users         },
  { id: 'stories',    label: 'Stories & Regions',    icon: Globe         },
  { id: 'modules',    label: 'Math Modules',         icon: Brain         },
  { id: 'courses',    label: 'LMS Courses',          icon: BookOpen      },
  { id: 'books',      label: 'Books Library',        icon: Library       },
  { id: 'essays',     label: 'Essays & Papers',      icon: FileText      },
  { id: 'processes',  label: 'Industrial Processes', icon: Beaker        },
  { id: 'community',  label: 'Community',            icon: MessageSquare },
  { id: 'sales',      label: 'Sales & Revenue',      icon: TrendingUp    },
  { id: 'payments',   label: 'Payment Management',   icon: DollarSign    },
  { id: 'import',     label: 'Import Courses',       icon: Upload        },
  { id: 'analytics',  label: 'Deep Analytics',       icon: BarChart3     },
];

const COMMUNITY_CHANNELS = ['general', 'essays', 'recipes', 'industrial', 'mathematics', 'announcements'];

const INPUT_CLS  = 'w-full bg-slate-800 border border-white/10 p-3 rounded-xl outline-none focus:ring-1 focus:ring-[#E95420] text-white text-sm';
const LABEL_CLS  = 'text-xs text-slate-500 font-bold uppercase mb-1 block';
const BTN_SAVE   = 'px-5 py-2.5 bg-[#E95420] text-white rounded-xl font-black text-sm hover:bg-[#c94418] transition-colors';
const BTN_CANCEL = 'px-5 py-2.5 bg-slate-700 text-white rounded-xl font-black text-sm hover:bg-slate-600 transition-colors';

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-black text-white">{value ?? '—'}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, count, onRefresh, onNew, newLabel }) {
  return (
    <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <h1 className="text-2xl sm:text-4xl font-black">
        {title}
        {count != null && <span className="text-slate-500 text-xl ml-2">({count})</span>}
      </h1>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button onClick={onRefresh} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-bold">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        )}
        {onNew && (
          <button onClick={onNew} className="flex items-center gap-1.5 px-4 py-2 bg-[#E95420] text-white rounded-xl text-sm font-black hover:bg-[#c94418] transition-colors">
            <Plus className="w-4 h-4" /> {newLabel || 'New'}
          </button>
        )}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Books form defaults
// ─────────────────────────────────────────────────────────────────────────────

const BOOK_DEFAULTS = {
  title: '', slug: '', author: '', description: '', coverUrl: '',
  sampleChapterUrl: '', fullFileUrl: '', price: 39.99, seriesNumber: '',
  category: '', tags: '', fileType: 'pdf', bundleEligible: false, published: false,
};

const ESSAY_DEFAULTS = {
  title: '', slug: '', author: '', abstract: '', fileUrl: '',
  category: '', tags: '', academiaUrl: '', featured: false, published: false,
};

const PROCESS_DEFAULTS = {
  title: '', slug: '', category: '', description: '', previewContent: '',
  coverUrl: '', fullFileUrl: '', price: 49.99, version: '', tags: '', scalingInstructions: '',
  expectedOutput: '', safetyNotes: '', published: false,
};

const STORY_DEFAULTS = {
  title: '', slug: '', description: '', videoUrl: '', thumbnailUrl: '',
  location: '', region: '', innovators: '', estimatedReadTime: 5,
};

const MODULE_DEFAULTS = {
  title: '', ubuntuFormula: '', difficultyLevel: 'medium',
  badgeReward: '', estimatedDuration: 30, problemSet: [],
};

const PROBLEM_DEFAULTS = { question: '', correctAnswer: '', explanation: '' };

// ─────────────────────────────────────────────────────────────────────────────
// Inline form panel
// ─────────────────────────────────────────────────────────────────────────────

function FormPanel({ title, onSave, onCancel, saving, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="bg-slate-900 border border-[#E95420]/40 rounded-2xl p-5 sm:p-7 mb-6"
    >
      <h3 className="text-lg font-black mb-5 text-[#E95420]">{title}</h3>
      <div className="space-y-4">{children}</div>
      <div className="flex items-center gap-3 mt-6">
        <button onClick={onSave} disabled={saving} className={BTN_SAVE}>
          {saving ? 'Saving…' : <><Save className="w-4 h-4 inline mr-1" />Save</>}
        </button>
        <button onClick={onCancel} className={BTN_CANCEL}>
          <XCircle className="w-4 h-4 inline mr-1" />Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Books section
// ─────────────────────────────────────────────────────────────────────────────

function BooksSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null | { mode:'new'|'edit', data, id }
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await booksAPI.getAllAdmin(); setBooks(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openNew  = () => setForm({ mode: 'new',  data: { ...BOOK_DEFAULTS }, id: null });
  const openEdit = (b) => setForm({ mode: 'edit', data: {
    title: b.title || '', slug: b.slug || '', author: b.author || '',
    description: b.description || '', coverUrl: b.coverUrl || '',
    sampleChapterUrl: b.sampleChapterUrl || '', fullFileUrl: b.fullFileUrl || '',
    price: b.price ?? 39.99, seriesNumber: b.seriesNumber || '',
    category: b.category || '', tags: Array.isArray(b.tags) ? b.tags.join(', ') : (b.tags || ''),
    fileType: b.fileType || 'pdf', bundleEligible: !!b.bundleEligible, published: !!b.published,
  }, id: b._id });

  const set = (k, v) => setForm((f) => ({ ...f, data: { ...f.data, [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form.data,
        tags: form.data.tags ? form.data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        price: parseFloat(form.data.price) || 0,
        seriesNumber: form.data.seriesNumber !== '' ? parseInt(form.data.seriesNumber) : undefined,
      };
      if (form.mode === 'new') {
        const { data } = await booksAPI.create(payload);
        setBooks((prev) => [data, ...prev]);
      } else {
        const { data } = await booksAPI.update(form.id, payload);
        setBooks((prev) => prev.map((b) => b._id === form.id ? data : b));
      }
      setForm(null);
    } catch (e) { console.error(e); alert(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book? This cannot be undone.')) return;
    try { await booksAPI.delete(id); setBooks((prev) => prev.filter((b) => b._id !== id)); }
    catch (e) { console.error(e); }
  };

  if (loading) return <Spinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader title="Books Library" count={books.length} onRefresh={load} onNew={openNew} newLabel="New Book" />

      <AnimatePresence>
        {form && (
          <FormPanel
            title={form.mode === 'new' ? 'Add New Book' : 'Edit Book'}
            onSave={handleSave} onCancel={() => setForm(null)} saving={saving}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Title *">
                <input className={INPUT_CLS} value={form.data.title} onChange={(e) => set('title', e.target.value)} placeholder="Book title" />
              </FormField>
              <FormField label="Slug *">
                <input className={INPUT_CLS} value={form.data.slug} onChange={(e) => set('slug', e.target.value)} placeholder="book-slug" />
              </FormField>
              <FormField label="Author">
                <input className={INPUT_CLS} value={form.data.author} onChange={(e) => set('author', e.target.value)} placeholder="Author name" />
              </FormField>
              <FormField label="Category">
                <input className={INPUT_CLS} value={form.data.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Mathematics" />
              </FormField>
              <FormField label="Price (USD)">
                <input type="number" className={INPUT_CLS} value={form.data.price} onChange={(e) => set('price', e.target.value)} step="0.01" min="0" />
              </FormField>
              <FormField label="Series Number">
                <input type="number" className={INPUT_CLS} value={form.data.seriesNumber} onChange={(e) => set('seriesNumber', e.target.value)} min="1" />
              </FormField>
              <FormField label="Cover URL">
                <input className={INPUT_CLS} value={form.data.coverUrl} onChange={(e) => set('coverUrl', e.target.value)} placeholder="https://..." />
              </FormField>
              <FormField label="Sample Chapter URL">
                <input className={INPUT_CLS} value={form.data.sampleChapterUrl} onChange={(e) => set('sampleChapterUrl', e.target.value)} placeholder="https://..." />
              </FormField>
              <FormField label="Full File URL">
                <input className={INPUT_CLS} value={form.data.fullFileUrl} onChange={(e) => set('fullFileUrl', e.target.value)} placeholder="https://..." />
              </FormField>              <FormField label="File Type">
                <select className={INPUT_CLS} value={form.data.fileType} onChange={(e) => set('fileType', e.target.value)}>
                  <option value="pdf">PDF</option>
                  <option value="epub">EPUB</option>
                  <option value="both">Both</option>
                </select>
              </FormField>
              <FormField label="Tags (comma-separated)">
                <input className={INPUT_CLS} value={form.data.tags} onChange={(e) => set('tags', e.target.value)} placeholder="tag1, tag2, tag3" />
              </FormField>
            </div>
            {/* File uploaders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
              <FileUploader
                label="📸 Upload Cover Image"
                accept=".jpg,.jpeg,.png,.webp"
                currentUrl={form.data.coverUrl}
                hint="JPG, PNG, WebP"
                onUploaded={(url) => set('coverUrl', url)}
              />
              <FileUploader
                label="📄 Upload Sample Chapter"
                accept=".pdf"
                currentUrl={form.data.sampleChapterUrl}
                hint="PDF only — free preview"
                onUploaded={(url) => set('sampleChapterUrl', url)}
              />
              <FileUploader
                label="📚 Upload Full Book File"
                accept=".pdf,.epub"
                currentUrl={form.data.fullFileUrl}
                hint="PDF or EPUB — paid download"
                onUploaded={(url) => set('fullFileUrl', url)}
              />
            </div>
            <FormField label="Description">
              <textarea className={INPUT_CLS} rows={4} value={form.data.description} onChange={(e) => set('description', e.target.value)} placeholder="Book description…" />
            </FormField>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.data.bundleEligible} onChange={(e) => set('bundleEligible', e.target.checked)} className="w-4 h-4 accent-[#E95420]" />
                <span className="text-sm text-slate-300 font-bold">Bundle Eligible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.data.published} onChange={(e) => set('published', e.target.checked)} className="w-4 h-4 accent-[#E95420]" />
                <span className="text-sm text-slate-300 font-bold">Published</span>
              </label>
            </div>
          </FormPanel>
        )}
      </AnimatePresence>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
        {books.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No books yet. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase">
                <tr>
                  {['Title', 'Author', 'Category', 'Price', 'Type', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {books.map((b) => (
                  <tr key={b._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-white max-w-[160px] truncate">{b.title}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-[120px] truncate">{b.author || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{b.category || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">${b.price ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400 uppercase text-xs">{b.fileType || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${b.published ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                        {b.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(b)} className="text-[#2D6EAA] hover:text-blue-300 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(b._id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Essays section
// ─────────────────────────────────────────────────────────────────────────────

function EssaysSection() {
  const [essays, setEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await essaysAPI.getAllAdmin(); setEssays(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openNew  = () => setForm({ mode: 'new', data: { ...ESSAY_DEFAULTS }, id: null });
  const openEdit = (e) => setForm({ mode: 'edit', data: {
    title: e.title || '', slug: e.slug || '', author: e.author || '',
    abstract: e.abstract || '', fileUrl: e.fileUrl || '',
    category: e.category || '', tags: Array.isArray(e.tags) ? e.tags.join(', ') : (e.tags || ''),
    academiaUrl: e.academiaUrl || '', featured: !!e.featured, published: !!e.published,
  }, id: e._id });

  const set = (k, v) => setForm((f) => ({ ...f, data: { ...f.data, [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form.data,
        tags: form.data.tags ? form.data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (form.mode === 'new') {
        const { data } = await essaysAPI.create(payload);
        setEssays((prev) => [data, ...prev]);
      } else {
        const { data } = await essaysAPI.update(form.id, payload);
        setEssays((prev) => prev.map((e) => e._id === form.id ? data : e));
      }
      setForm(null);
    } catch (e) { console.error(e); alert(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this essay?')) return;
    try { await essaysAPI.delete(id); setEssays((prev) => prev.filter((e) => e._id !== id)); }
    catch (e) { console.error(e); }
  };

  if (loading) return <Spinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader title="Essays & Papers" count={essays.length} onRefresh={load} onNew={openNew} newLabel="New Essay" />

      <AnimatePresence>
        {form && (
          <FormPanel
            title={form.mode === 'new' ? 'Add New Essay' : 'Edit Essay'}
            onSave={handleSave} onCancel={() => setForm(null)} saving={saving}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Title *">
                <input className={INPUT_CLS} value={form.data.title} onChange={(e) => set('title', e.target.value)} placeholder="Essay title" />
              </FormField>
              <FormField label="Slug *">
                <input className={INPUT_CLS} value={form.data.slug} onChange={(e) => set('slug', e.target.value)} placeholder="essay-slug" />
              </FormField>
              <FormField label="Author">
                <input className={INPUT_CLS} value={form.data.author} onChange={(e) => set('author', e.target.value)} placeholder="Author name" />
              </FormField>
              <FormField label="Category">
                <input className={INPUT_CLS} value={form.data.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Philosophy" />
              </FormField>
              <FormField label="File URL">
                <input className={INPUT_CLS} value={form.data.fileUrl} onChange={(e) => set('fileUrl', e.target.value)} placeholder="https://..." />
              </FormField>
              <FormField label="Academia URL">
                <input className={INPUT_CLS} value={form.data.academiaUrl} onChange={(e) => set('academiaUrl', e.target.value)} placeholder="https://academia.edu/..." />
              </FormField>
              <FormField label="Tags (comma-separated)">
                <input className={INPUT_CLS} value={form.data.tags} onChange={(e) => set('tags', e.target.value)} placeholder="tag1, tag2" />
              </FormField>
            </div>
            {/* Essay file uploader */}
            <FileUploader
              label="📄 Upload Essay / Paper (PDF)"
              accept=".pdf"
              currentUrl={form.data.fileUrl}
              hint="PDF — free download for users"
              onUploaded={(url) => set('fileUrl', url)}
            />
            <FormField label="Abstract">
              <textarea className={INPUT_CLS} rows={4} value={form.data.abstract} onChange={(e) => set('abstract', e.target.value)} placeholder="Essay abstract…" />
            </FormField>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.data.featured} onChange={(e) => set('featured', e.target.checked)} className="w-4 h-4 accent-[#E95420]" />
                <span className="text-sm text-slate-300 font-bold">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.data.published} onChange={(e) => set('published', e.target.checked)} className="w-4 h-4 accent-[#E95420]" />
                <span className="text-sm text-slate-300 font-bold">Published</span>
              </label>
            </div>
          </FormPanel>
        )}
      </AnimatePresence>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
        {essays.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No essays yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase">
                <tr>
                  {['Title', 'Author', 'Category', 'Featured', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {essays.map((e) => (
                  <tr key={e._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-white max-w-[180px] truncate">{e.title}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-[120px] truncate">{e.author || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{e.category || '—'}</td>
                    <td className="px-4 py-3">
                      {e.featured ? <Star className="w-4 h-4 text-yellow-400" /> : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${e.published ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                        {e.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(e)} className="text-[#2D6EAA] hover:text-blue-300 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(e._id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Industrial Processes section
// ─────────────────────────────────────────────────────────────────────────────

function ProcessesSection() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await processesAPI.getAllAdmin(); setProcesses(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openNew  = () => setForm({ mode: 'new', data: { ...PROCESS_DEFAULTS }, id: null });
  const openEdit = (p) => setForm({ mode: 'edit', data: {
    title: p.title || '', slug: p.slug || '', category: p.category || '',
    description: p.description || '', previewContent: p.previewContent || '',
    coverUrl: p.coverUrl || '', fullFileUrl: p.fullFileUrl || '', price: p.price ?? 49.99, version: p.version || '',
    tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
    scalingInstructions: p.scalingInstructions || '', expectedOutput: p.expectedOutput || '',
    safetyNotes: p.safetyNotes || '', published: !!p.published,
  }, id: p._id });

  const set = (k, v) => setForm((f) => ({ ...f, data: { ...f.data, [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form.data,
        tags: form.data.tags ? form.data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        price: parseFloat(form.data.price) || 0,
      };
      if (form.mode === 'new') {
        const { data } = await processesAPI.create(payload);
        setProcesses((prev) => [data, ...prev]);
      } else {
        const { data } = await processesAPI.update(form.id, payload);
        setProcesses((prev) => prev.map((p) => p._id === form.id ? data : p));
      }
      setForm(null);
    } catch (e) { console.error(e); alert(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this process?')) return;
    try { await processesAPI.delete(id); setProcesses((prev) => prev.filter((p) => p._id !== id)); }
    catch (e) { console.error(e); }
  };

  if (loading) return <Spinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader title="Industrial Processes" count={processes.length} onRefresh={load} onNew={openNew} newLabel="New Process" />

      <AnimatePresence>
        {form && (
          <FormPanel
            title={form.mode === 'new' ? 'Add New Process' : 'Edit Process'}
            onSave={handleSave} onCancel={() => setForm(null)} saving={saving}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Title *">
                <input className={INPUT_CLS} value={form.data.title} onChange={(e) => set('title', e.target.value)} placeholder="Process title" />
              </FormField>
              <FormField label="Slug *">
                <input className={INPUT_CLS} value={form.data.slug} onChange={(e) => set('slug', e.target.value)} placeholder="process-slug" />
              </FormField>
              <FormField label="Category">
                <input className={INPUT_CLS} value={form.data.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Chemical" />
              </FormField>
              <FormField label="Price (USD)">
                <input type="number" className={INPUT_CLS} value={form.data.price} onChange={(e) => set('price', e.target.value)} step="0.01" min="0" />
              </FormField>
              <FormField label="Version">
                <input className={INPUT_CLS} value={form.data.version} onChange={(e) => set('version', e.target.value)} placeholder="e.g. 1.0.0" />
              </FormField>
              <FormField label="Cover URL">
                <input className={INPUT_CLS} value={form.data.coverUrl} onChange={(e) => set('coverUrl', e.target.value)} placeholder="https://..." />
              </FormField>
              <FormField label="Expected Output">
                <input className={INPUT_CLS} value={form.data.expectedOutput} onChange={(e) => set('expectedOutput', e.target.value)} placeholder="e.g. 500L/batch" />
              </FormField>
              <FormField label="Tags (comma-separated)">
                <input className={INPUT_CLS} value={form.data.tags} onChange={(e) => set('tags', e.target.value)} placeholder="tag1, tag2" />
              </FormField>
            </div>
            {/* Process file uploaders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <FileUploader
                label="🖼️ Upload Cover Image"
                accept=".jpg,.jpeg,.png,.webp"
                currentUrl={form.data.coverUrl}
                hint="JPG, PNG, WebP"
                onUploaded={(url) => set('coverUrl', url)}
              />
              <FileUploader
                label="📄 Upload Full Process Document"
                accept=".pdf,.zip"
                currentUrl={form.data.fullFileUrl}
                hint="PDF or ZIP — paid download"
                onUploaded={(url) => set('fullFileUrl', url)}
              />
            </div>
            <FormField label="Description">
              <textarea className={INPUT_CLS} rows={3} value={form.data.description} onChange={(e) => set('description', e.target.value)} placeholder="Process description…" />
            </FormField>
            <FormField label="Preview Content">
              <textarea className={INPUT_CLS} rows={3} value={form.data.previewContent} onChange={(e) => set('previewContent', e.target.value)} placeholder="Free preview content…" />
            </FormField>
            <FormField label="Scaling Instructions">
              <textarea className={INPUT_CLS} rows={3} value={form.data.scalingInstructions} onChange={(e) => set('scalingInstructions', e.target.value)} placeholder="How to scale this process…" />
            </FormField>
            <FormField label="Safety Notes">
              <textarea className={INPUT_CLS} rows={3} value={form.data.safetyNotes} onChange={(e) => set('safetyNotes', e.target.value)} placeholder="Safety precautions…" />
            </FormField>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.data.published} onChange={(e) => set('published', e.target.checked)} className="w-4 h-4 accent-[#E95420]" />
              <span className="text-sm text-slate-300 font-bold">Published</span>
            </label>
          </FormPanel>
        )}
      </AnimatePresence>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
        {processes.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No processes yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase">
                <tr>
                  {['Title', 'Category', 'Price', 'Version', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processes.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-white max-w-[180px] truncate">{p.title}</td>
                    <td className="px-4 py-3 text-slate-400">{p.category || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">${p.price ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{p.version || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.published ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                        {p.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="text-[#2D6EAA] hover:text-blue-300 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stories section
// ─────────────────────────────────────────────────────────────────────────────

function StoriesSection() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await storiesAPI.getAll(); setStories(Array.isArray(data) ? data : data.stories || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openNew  = () => setForm({ mode: 'new', data: { ...STORY_DEFAULTS }, id: null });
  const openEdit = (s) => setForm({ mode: 'edit', data: {
    title: s.title || '', slug: s.slug || '', description: s.description || '',
    videoUrl: s.videoUrl || '', thumbnailUrl: s.thumbnailUrl || '',
    location: s.location || '', region: s.region || '',
    innovators: Array.isArray(s.innovators) ? s.innovators.join(', ') : (s.innovators || ''),
    estimatedReadTime: s.estimatedReadTime || 5,
  }, id: s._id });

  const set = (k, v) => setForm((f) => ({ ...f, data: { ...f.data, [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form.data,
        innovators: form.data.innovators ? form.data.innovators.split(',').map((i) => i.trim()).filter(Boolean) : [],
        estimatedReadTime: parseInt(form.data.estimatedReadTime) || 5,
      };
      if (form.mode === 'new') {
        const { data } = await storiesAPI.create(payload);
        setStories((prev) => [data, ...prev]);
      } else {
        const { data } = await storiesAPI.update(form.id, payload);
        setStories((prev) => prev.map((s) => s._id === form.id ? data : s));
      }
      setForm(null);
    } catch (e) { console.error(e); alert(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this story?')) return;
    try { await storiesAPI.delete(id); setStories((prev) => prev.filter((s) => s._id !== id)); }
    catch (e) { console.error(e); }
  };

  if (loading) return <Spinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader title="Stories & Regions" count={stories.length} onRefresh={load} onNew={openNew} newLabel="New Story" />

      <AnimatePresence>
        {form && (
          <FormPanel
            title={form.mode === 'new' ? 'Add New Story' : 'Edit Story'}
            onSave={handleSave} onCancel={() => setForm(null)} saving={saving}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Title *">
                <input className={INPUT_CLS} value={form.data.title} onChange={(e) => set('title', e.target.value)} placeholder="Story title" />
              </FormField>
              <FormField label="Slug *">
                <input className={INPUT_CLS} value={form.data.slug} onChange={(e) => set('slug', e.target.value)} placeholder="story-slug" />
              </FormField>
              <FormField label="Location">
                <input className={INPUT_CLS} value={form.data.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Lagos, Nigeria" />
              </FormField>
              <FormField label="Region">
                <input className={INPUT_CLS} value={form.data.region} onChange={(e) => set('region', e.target.value)} placeholder="e.g. West Africa" />
              </FormField>
              <FormField label="Video URL">
                <input className={INPUT_CLS} value={form.data.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://..." />
              </FormField>
              <FormField label="Thumbnail URL">
                <input className={INPUT_CLS} value={form.data.thumbnailUrl} onChange={(e) => set('thumbnailUrl', e.target.value)} placeholder="https://..." />
              </FormField>
              <FormField label="Estimated Read Time (min)">
                <input type="number" className={INPUT_CLS} value={form.data.estimatedReadTime} onChange={(e) => set('estimatedReadTime', e.target.value)} min="1" />
              </FormField>
              <FormField label="Innovators (comma-separated)">
                <input className={INPUT_CLS} value={form.data.innovators} onChange={(e) => set('innovators', e.target.value)} placeholder="Name1, Name2" />
              </FormField>
            </div>
            <FormField label="Description">
              <textarea className={INPUT_CLS} rows={4} value={form.data.description} onChange={(e) => set('description', e.target.value)} placeholder="Story description…" />
            </FormField>
          </FormPanel>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {stories.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-slate-900/50 border border-white/10 rounded-2xl">No stories yet.</div>
        ) : stories.map((s) => (
          <div key={s._id} className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            {s.thumbnailUrl && (
              <img src={s.thumbnailUrl} alt={s.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-slate-800" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-black text-white truncate">{s.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {s.location && <span>{s.location}</span>}
                {s.region && <span> · {s.region}</span>}
                {s.estimatedReadTime && <span> · {s.estimatedReadTime} min read</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => openEdit(s)} className="text-[#2D6EAA] hover:text-blue-300 transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(s._id)} className="text-red-400 hover:text-red-300 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Math Modules section
// ─────────────────────────────────────────────────────────────────────────────

function ModulesSection() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await modulesAPI.getAll(); setModules(Array.isArray(data) ? data : data.modules || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openNew  = () => setForm({ mode: 'new', data: { ...MODULE_DEFAULTS, problemSet: [] }, id: null });
  const openEdit = (m) => setForm({ mode: 'edit', data: {
    title: m.title || '', ubuntuFormula: m.ubuntuFormula || '',
    difficultyLevel: m.difficultyLevel || 'medium', badgeReward: m.badgeReward || '',
    estimatedDuration: m.estimatedDuration || 30,
    problemSet: Array.isArray(m.problemSet) ? m.problemSet.map((p) => ({ ...p })) : [],
  }, id: m._id });

  const set = (k, v) => setForm((f) => ({ ...f, data: { ...f.data, [k]: v } }));

  const addProblem = () => setForm((f) => ({
    ...f, data: { ...f.data, problemSet: [...f.data.problemSet, { ...PROBLEM_DEFAULTS }] }
  }));

  const removeProblem = (idx) => setForm((f) => ({
    ...f, data: { ...f.data, problemSet: f.data.problemSet.filter((_, i) => i !== idx) }
  }));

  const setProblem = (idx, k, v) => setForm((f) => ({
    ...f, data: {
      ...f.data,
      problemSet: f.data.problemSet.map((p, i) => i === idx ? { ...p, [k]: v } : p)
    }
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form.data,
        estimatedDuration: parseInt(form.data.estimatedDuration) || 30,
      };
      if (form.mode === 'new') {
        const { data } = await modulesAPI.create(payload);
        setModules((prev) => [data, ...prev]);
      } else {
        const { data } = await modulesAPI.update(form.id, payload);
        setModules((prev) => prev.map((m) => m._id === form.id ? data : m));
      }
      setForm(null);
    } catch (e) { console.error(e); alert(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this module?')) return;
    try { await modulesAPI.delete(id); setModules((prev) => prev.filter((m) => m._id !== id)); }
    catch (e) { console.error(e); }
  };

  if (loading) return <Spinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader title="Math Modules" count={modules.length} onRefresh={load} onNew={openNew} newLabel="New Module" />

      <AnimatePresence>
        {form && (
          <FormPanel
            title={form.mode === 'new' ? 'Add New Module' : 'Edit Module'}
            onSave={handleSave} onCancel={() => setForm(null)} saving={saving}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Title *">
                <input className={INPUT_CLS} value={form.data.title} onChange={(e) => set('title', e.target.value)} placeholder="Module title" />
              </FormField>
              <FormField label="Ubuntu Formula">
                <input className={INPUT_CLS} value={form.data.ubuntuFormula} onChange={(e) => set('ubuntuFormula', e.target.value)} placeholder="e.g. I+We=Us" />
              </FormField>
              <FormField label="Difficulty Level">
                <select className={INPUT_CLS} value={form.data.difficultyLevel} onChange={(e) => set('difficultyLevel', e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </FormField>
              <FormField label="Badge Reward">
                <input className={INPUT_CLS} value={form.data.badgeReward} onChange={(e) => set('badgeReward', e.target.value)} placeholder="Badge name" />
              </FormField>
              <FormField label="Estimated Duration (min)">
                <input type="number" className={INPUT_CLS} value={form.data.estimatedDuration} onChange={(e) => set('estimatedDuration', e.target.value)} min="1" />
              </FormField>
            </div>

            {/* Problem Set Editor */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={LABEL_CLS}>Problem Set ({form.data.problemSet.length})</label>
                <button type="button" onClick={addProblem}
                  className="flex items-center gap-1 text-xs text-[#E95420] font-bold hover:text-orange-300 transition-colors">
                  <Plus className="w-3 h-3" /> Add Problem
                </button>
              </div>
              <div className="space-y-4">
                {form.data.problemSet.map((prob, idx) => (
                  <div key={idx} className="bg-slate-800/60 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Problem {idx + 1}</span>
                      <button type="button" onClick={() => removeProblem(idx)} className="text-red-400 hover:text-red-300">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <FormField label="Question">
                      <input className={INPUT_CLS} value={prob.question} onChange={(e) => setProblem(idx, 'question', e.target.value)} placeholder="Problem question" />
                    </FormField>
                    <FormField label="Correct Answer">
                      <input className={INPUT_CLS} value={prob.correctAnswer} onChange={(e) => setProblem(idx, 'correctAnswer', e.target.value)} placeholder="Correct answer" />
                    </FormField>
                    <FormField label="Explanation">
                      <textarea className={INPUT_CLS} rows={2} value={prob.explanation} onChange={(e) => setProblem(idx, 'explanation', e.target.value)} placeholder="Explanation…" />
                    </FormField>
                  </div>
                ))}
                {form.data.problemSet.length === 0 && (
                  <p className="text-xs text-slate-600 italic">No problems added yet.</p>
                )}
              </div>
            </div>
          </FormPanel>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {modules.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-slate-900/50 border border-white/10 rounded-2xl">No modules yet.</div>
        ) : modules.map((m) => (
          <div key={m._id} className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-black text-white truncate">{m.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className={`capitalize font-bold ${m.difficultyLevel === 'hard' ? 'text-red-400' : m.difficultyLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {m.difficultyLevel}
                </span>
                {m.badgeReward && <span> · 🏅 {m.badgeReward}</span>}
                {m.problemSet?.length > 0 && <span> · {m.problemSet.length} problems</span>}
                {m.estimatedDuration && <span> · {m.estimatedDuration} min</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => openEdit(m)} className="text-[#2D6EAA] hover:text-blue-300 transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(m._id)} className="text-red-400 hover:text-red-300 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Community section
// ─────────────────────────────────────────────────────────────────────────────

function CommunitySection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState('');

  const load = useCallback(async (ch) => {
    setLoading(true);
    try {
      const params = ch ? { channel: ch } : {};
      const { data } = await communityAPI.getPosts(params);
      setPosts(Array.isArray(data) ? data : data.posts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(channel); }, [load, channel]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try { await communityAPI.deletePost(id); setPosts((prev) => prev.filter((p) => p._id !== id)); }
    catch (e) { console.error(e); }
  };

  const handlePin = async (id) => {
    try {
      const { data } = await communityAPI.pinPost(id);
      setPosts((prev) => prev.map((p) => p._id === id ? { ...p, pinned: data.pinned } : p));
    } catch (e) { console.error(e); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader title="Community" count={posts.length} onRefresh={() => load(channel)} />

      {/* Channel filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setChannel('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${!channel ? 'bg-[#E95420] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          All
        </button>
        {COMMUNITY_CHANNELS.map((ch) => (
          <button
            key={ch}
            onClick={() => setChannel(ch)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${channel === ch ? 'bg-[#E95420] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            #{ch}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 bg-slate-900/50 border border-white/10 rounded-2xl">No posts found.</div>
          ) : posts.map((post) => (
            <div key={post._id} className={`bg-slate-900/50 border rounded-2xl p-4 transition-colors ${post.pinned ? 'border-[#E95420]/40' : 'border-white/10'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {post.pinned && <Pin className="w-3 h-3 text-[#E95420] flex-shrink-0" />}
                    <span className="font-black text-white text-sm truncate">
                      {post.author?.name || post.userId?.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full capitalize flex-shrink-0">
                      #{post.channel || 'general'}
                    </span>
                    {post.createdAt && (
                      <span className="text-xs text-slate-600 flex-shrink-0">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-3">{post.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500">❤️ {post.likes?.length || post.likeCount || 0} likes</span>
                    {post.replies?.length > 0 && (
                      <span className="text-xs text-slate-500">💬 {post.replies.length} replies</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handlePin(post._id)}
                    title={post.pinned ? 'Unpin' : 'Pin'}
                    className={`p-1.5 rounded-lg transition-colors ${post.pinned ? 'text-[#E95420] bg-[#E95420]/10' : 'text-slate-500 hover:text-[#E95420] hover:bg-[#E95420]/10'}`}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics section
// ─────────────────────────────────────────────────────────────────────────────

function AnalyticsSection({ stats }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl sm:text-4xl font-black mb-6">Deep Analytics</h1>

      {!stats ? (
        <div className="text-center py-20 text-slate-500">No analytics data available.</div>
      ) : (
        <div className="space-y-8">
          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            <StatCard icon={<Users className="text-[#2D6EAA] w-4 h-4" />} label="Total Users" value={stats.stats?.totalUsers} sub="Registered citizens" />
            <StatCard icon={<BookOpen className="text-[#E95420] w-4 h-4" />} label="Enrollments" value={stats.stats?.totalEnrollments} sub="Active learners" />
            <StatCard icon={<BarChart3 className="text-[#38A169] w-4 h-4" />} label="Conversion" value={`${stats.stats?.conversionRate ?? 0}%`} sub="Free → Paid" />
            <StatCard icon={<TrendingUp className="text-purple-400 w-4 h-4" />} label="Completion" value={`${stats.stats?.completionRate ?? 0}%`} sub="Module completion" />
          </div>

          {/* Recent events */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 sm:p-7">
            <h2 className="text-base sm:text-xl font-black mb-5 flex items-center gap-2">
              <Activity className="text-[#E95420] w-5 h-5" /> Recent Events
            </h2>
            {stats.recentEvents?.length > 0 ? (
              <div className="space-y-2">
                {stats.recentEvents.slice(0, 20).map((ev, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 gap-3">
                    <span className="text-slate-400 font-mono text-xs bg-slate-800 px-2 py-0.5 rounded flex-shrink-0">{ev.eventType}</span>
                    <span className="text-slate-500 text-xs truncate flex-1">{ev.userId?.name || 'GUEST'} — {ev.path}</span>
                    <span className="text-slate-600 text-xs flex-shrink-0">{ev.createdAt ? new Date(ev.createdAt).toLocaleTimeString() : ''}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No recent events.</p>
            )}
          </div>

          {/* Top content */}
          {stats.topContent && (
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 sm:p-7">
              <h2 className="text-base sm:text-xl font-black mb-5 flex items-center gap-2">
                <TrendingUp className="text-[#38A169] w-5 h-5" /> Top Content
              </h2>
              <div className="space-y-2">
                {stats.topContent.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 gap-3">
                    <span className="text-white font-bold text-sm truncate flex-1">{item.title || item._id}</span>
                    <span className="text-slate-400 text-xs flex-shrink-0">{item.views || item.count || 0} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue */}
          {stats.revenue != null && (
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 sm:p-7">
              <h2 className="text-base sm:text-xl font-black mb-2 flex items-center gap-2">
                <Hash className="text-yellow-400 w-5 h-5" /> Revenue
              </h2>
              <p className="text-4xl font-black text-white">${(stats.revenue / 100).toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">Total platform revenue</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sales Dashboard section
// ─────────────────────────────────────────────────────────────────────────────

function SalesDashboardSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await marketplaceAPI.getSalesDashboard();
      setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader title="Sales & Revenue" onRefresh={load} />

      {data ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<TrendingUp className="text-[#38A169] w-4 h-4" />} label="Total Revenue" value={`$${data.summary?.totalRevenue}`} sub="All time" />
            <StatCard icon={<ShoppingCart className="text-[#E95420] w-4 h-4" />} label="Purchases" value={data.summary?.totalPurchases} sub="Completed" />
            <StatCard icon={<Download className="text-[#2D6EAA] w-4 h-4" />} label="Downloads" value={data.summary?.totalDownloads} sub="Total" />
            <StatCard icon={<AlertTriangle className="text-yellow-400 w-4 h-4" />} label="Alerts" value={data.summary?.suspiciousAlerts} sub="Suspicious activity" />
          </div>

          {/* Revenue by product */}
          {data.revenueByProduct && (
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
              <h3 className="font-black text-white mb-4">Revenue by Product</h3>
              <div className="space-y-3">
                {Object.entries(data.revenueByProduct).map(([type, revenue]) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 capitalize w-32 flex-shrink-0">{type}</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#E95420] rounded-full"
                        style={{ width: `${Math.min(100, (revenue / Math.max(...Object.values(data.revenueByProduct))) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-black text-white w-20 text-right">${Number(revenue).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent purchases */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="font-black text-white">Recent Purchases</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase">
                  <tr>
                    {['Product', 'Type', 'Amount', 'License ID', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-bold tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentPurchases?.slice(0, 15).map((p, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white font-bold max-w-[150px] truncate">{p.productType || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{p.productType || '—'}</td>
                      <td className="px-4 py-3 text-[#38A169] font-black">${p.amountPaid}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.licenseId || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Suspicious alerts */}
          {data.alerts?.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
              <h3 className="font-black text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Suspicious Download Alerts
              </h3>
              <div className="space-y-2">
                {data.alerts.map((alert, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-red-500/10">
                    <span className="text-red-300 font-bold">{alert.alertType}</span>
                    <span className="text-slate-500">{alert.ipAddress} — {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">No sales data available.</div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E95420]" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AdminPage component
// ─────────────────────────────────────────────────────────────────────────────
// Sidebar nav (defined outside AdminPage to avoid re-creation on render)
// ─────────────────────────────────────────────────────────────────────────────

function SidebarContent({ tab, switchTab }) {
  return (
    <>
      <div className="px-6 mb-8 pt-2">
        <div className="flex items-center gap-2 text-[#38A169] mb-1">
          <Shield size={22} />
          <span className="font-black text-xl tracking-tighter italic">ADMIN</span>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Sovereign Oversight</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all font-bold text-sm ${
              tab === t.id
                ? 'bg-[#E95420] text-white shadow-lg shadow-[#E95420]/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <t.icon size={17} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-5 border-t border-white/5 mt-4 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
          <ArrowLeft size={15} /> Exit to Platform
        </Link>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared data for overview / analytics
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Google import state
  const [googleCourses, setGoogleCourses]     = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [googleLoading, setGoogleLoading]     = useState(false);
  const [importResult, setImportResult]       = useState(null);

  const authSuccess = searchParams.get('auth') === 'success';

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, coursesRes] = await Promise.allSettled([
        adminAPI.getStats(), adminAPI.getUsers(), coursesAPI.getAll(),
      ]);
      if (statsRes.status === 'fulfilled')   setStats(statsRes.value.data);
      if (usersRes.status === 'fulfilled')   setUsers(usersRes.value.data);
      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadAll();
    if (authSuccess) {
      setTab('import');
      googleAPI.listCourses(user?._id)
        .then(({ data }) => setGoogleCourses(data))
        .catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => { setSearchParams({ tab }); }, [tab, setSearchParams]);

  const switchTab = (id) => { setTab(id); setSidebarOpen(false); };

  const handleConnectGoogle = async () => {
    try { const { data } = await googleAPI.getAuthUrl(user._id); window.location.href = data.url; }
    catch (e) { console.error(e); }
  };

  const handleImport = async () => {
    if (!selectedCourses.length) return;
    setGoogleLoading(true);
    try {
      const { data } = await googleAPI.importCourses({ userId: user._id, courseIds: selectedCourses });
      setImportResult(data);
    } catch (e) { console.error(e); }
    finally { setGoogleLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try { await adminAPI.deleteUser(id); setUsers((prev) => prev.filter((u) => u._id !== id)); }
    catch (e) { console.error(e); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const { data } = await adminAPI.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => u._id === id ? data : u));
    } catch (e) { console.error(e); }
  };

  const handleTogglePublish = async (course) => {
    try {
      const { data } = await coursesAPI.update(course._id, { published: !course.published });
      setCourses((prev) => prev.map((c) => c._id === course._id ? data : c));
    } catch (e) { console.error(e); }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return;
    try { await coursesAPI.delete(id); setCourses((prev) => prev.filter((c) => c._id !== id)); }
    catch (e) { console.error(e); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white font-sans flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-white/10 flex-col pt-8 flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent tab={tab} switchTab={switchTab} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -270 }} animate={{ x: 0 }} exit={{ x: -270 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-white/10 flex flex-col pt-8 z-50 lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
              <SidebarContent tab={tab} switchTab={switchTab} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-white/10 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#38A169]" />
            <span className="font-black text-sm italic text-white">ADMIN</span>
          </div>
          <span className="ml-auto text-xs text-slate-400 font-bold uppercase tracking-wider">
            {TABS.find((t) => t.id === tab)?.label}
          </span>
        </div>

        {/* Mobile bottom tab bar — show first 6 tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 z-30 flex overflow-x-auto">
          {TABS.slice(0, 6).map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors min-w-[52px] ${
                tab === t.id ? 'text-[#E95420]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <t.icon size={17} />
              <span className="truncate w-full text-center px-0.5 leading-tight">{t.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

            {/* ── Overview ── */}
            {tab === 'overview' && (
              loading ? <Spinner /> : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="text-2xl sm:text-4xl font-black mb-6">System Overview</h1>
                  {stats ? (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
                        <StatCard icon={<Users className="text-[#2D6EAA] w-4 h-4" />} label="Citizens" value={stats.stats?.totalUsers} sub="+12% weekly" />
                        <StatCard icon={<Activity className="text-[#E95420] w-4 h-4" />} label="Badges" value={stats.stats?.totalBadges} sub="Awarded" />
                        <StatCard icon={<BarChart3 className="text-[#38A169] w-4 h-4" />} label="Conversion" value={`${stats.stats?.conversionRate ?? 0}%`} sub="Target: 45%" />
                        <StatCard icon={<TrendingUp className="text-purple-400 w-4 h-4" />} label="Completion" value={`${stats.stats?.completionRate ?? 0}%`} sub="All modules" />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-5 sm:p-7">
                          <h2 className="text-base sm:text-xl font-black mb-5 flex items-center gap-2">
                            <Activity className="text-[#E95420] w-5 h-5" /> Real-time Activity
                          </h2>
                          <div className="space-y-2">
                            {stats.recentEvents?.slice(0, 8).map((ev, i) => (
                              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 gap-2">
                                <span className="text-slate-400 font-mono text-xs bg-slate-800 px-2 py-0.5 rounded flex-shrink-0">{ev.eventType}</span>
                                <span className="text-slate-500 text-xs truncate">{ev.userId?.name || 'GUEST'} — {ev.path}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-900 border border-white/10 p-7 rounded-2xl flex flex-col justify-center text-center">
                          <Shield className="w-14 h-14 text-[#38A169] mx-auto mb-4" />
                          <h2 className="text-xl font-black mb-1">Data Integrity: Optimal</h2>
                          <p className="text-slate-500 text-sm">All systems operational</p>
                          <button onClick={loadAll} className="mt-5 mx-auto flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold">
                            <RefreshCw className="w-4 h-4" /> Refresh Stats
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500 text-center py-20">No stats available.</div>
                  )}
                </motion.div>
              )
            )}

            {/* ── Citizens ── */}
            {tab === 'citizens' && (
              loading ? <Spinner /> : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SectionHeader title="Citizens" count={users.length} onRefresh={loadAll} />

                  {/* Mobile cards */}
                  <div className="sm:hidden space-y-3">
                    {users.map((u) => (
                      <div key={u._id} className="bg-slate-900/50 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <p className="font-black text-white truncate">{u.name}</p>
                            <p className="text-xs text-slate-500 truncate">{u.email}</p>
                          </div>
                          {u._id !== user._id && (
                            <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-300 flex-shrink-0 p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="bg-slate-800 border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                          >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                          </select>
                          <span className="text-xs text-slate-500">{u.badges?.length || 0} badges</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase">
                          <tr>
                            {['Name', 'Email', 'Role', 'Badges', 'Actions'].map((h) => (
                              <th key={h} className="px-5 py-4 text-left font-bold tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users.map((u) => (
                            <tr key={u._id} className="hover:bg-white/5 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-white">{u.name}</td>
                              <td className="px-5 py-3.5 text-slate-400 max-w-[180px] truncate">{u.email}</td>
                              <td className="px-5 py-3.5">
                                <select
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                  className="bg-slate-800 border border-white/10 text-white text-xs rounded-lg px-2 py-1 focus:outline-none"
                                >
                                  <option value="student">Student</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="px-5 py-3.5 text-slate-400">{u.badges?.length || 0}</td>
                              <td className="px-5 py-3.5">
                                {u._id !== user._id && (
                                  <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-300 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )
            )}

            {/* ── Stories & Regions ── */}
            {tab === 'stories' && <StoriesSection />}

            {/* ── Math Modules ── */}
            {tab === 'modules' && <ModulesSection />}

            {/* ── LMS Courses ── */}
            {tab === 'courses' && (
              loading ? <Spinner /> : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SectionHeader title="LMS Courses" count={courses.length} onRefresh={loadAll} />

                  {/* Mobile cards */}
                  <div className="sm:hidden space-y-3">
                    {courses.map((c) => (
                      <div key={c._id} className="bg-slate-900/50 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <p className="font-black text-white text-sm truncate">{c.title}</p>
                            <p className="text-xs text-slate-500 capitalize mt-0.5">{c.level} · {c.requiredTier} · {c.lessons?.length || 0} lessons</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${c.published ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                            {c.published ? 'Live' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleTogglePublish(c)} className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors font-bold">
                            {c.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button onClick={() => handleDeleteCourse(c._id)} className="text-red-400 hover:text-red-300 p-1.5">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase">
                          <tr>
                            {['Title', 'Level', 'Tier', 'Lessons', 'Status', 'Actions'].map((h) => (
                              <th key={h} className="px-5 py-4 text-left font-bold tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {courses.map((c) => (
                            <tr key={c._id} className="hover:bg-white/5 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-white max-w-[200px] truncate">{c.title}</td>
                              <td className="px-5 py-3.5 capitalize text-slate-400">{c.level}</td>
                              <td className="px-5 py-3.5 capitalize text-slate-400">{c.requiredTier}</td>
                              <td className="px-5 py-3.5 text-slate-400">{c.lessons?.length || 0}</td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.published ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                  {c.published ? 'Published' : 'Draft'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleTogglePublish(c)} className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors font-bold">
                                    {c.published ? 'Unpublish' : 'Publish'}
                                  </button>
                                  <button onClick={() => handleDeleteCourse(c._id)} className="text-red-400 hover:text-red-300 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )
            )}

            {/* ── Books ── */}
            {tab === 'books' && <BooksSection />}

            {/* ── Essays ── */}
            {tab === 'essays' && <EssaysSection />}

            {/* ── Processes ── */}
            {tab === 'processes' && <ProcessesSection />}

            {/* ── Community ── */}
            {tab === 'community' && <CommunitySection />}

            {/* ── Import Courses ── */}
            {tab === 'import' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl sm:text-4xl font-black mb-6">Import Courses</h1>
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 sm:p-8">
                  <h2 className="text-lg sm:text-xl font-black text-white mb-2">Import from Google Classroom</h2>
                  <p className="text-slate-400 text-sm mb-7">Connect your Google account to import courses from Google Classroom.</p>

                  {!authSuccess ? (
                    <button
                      onClick={handleConnectGoogle}
                      className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/20 rounded-2xl font-bold text-white hover:bg-white/10 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> Connect Google Account
                    </button>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-[#38A169] text-sm font-bold">
                        <Check className="w-4 h-4" /> Google account connected
                      </div>

                      <button
                        onClick={() => {
                          setGoogleLoading(true);
                          googleAPI.listCourses(user._id)
                            .then(({ data }) => setGoogleCourses(data))
                            .catch(console.error)
                            .finally(() => setGoogleLoading(false));
                        }}
                        disabled={googleLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#2D6EAA] text-white rounded-xl text-sm font-black hover:bg-[#245a8e] transition-colors disabled:opacity-60"
                      >
                        <RefreshCw className={`w-4 h-4 ${googleLoading ? 'animate-spin' : ''}`} />
                        {googleLoading ? 'Loading…' : 'Load Courses'}
                      </button>

                      {googleCourses.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-bold text-slate-300">Select courses to import:</p>
                          {googleCourses.map((c) => (
                            <label
                              key={c.id}
                              className="flex items-center gap-3 p-4 bg-slate-800/50 border border-white/10 rounded-2xl cursor-pointer hover:border-[#2D6EAA]/30 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCourses.includes(c.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedCourses((prev) => [...prev, c.id]);
                                  else setSelectedCourses((prev) => prev.filter((id) => id !== c.id));
                                }}
                                className="w-4 h-4 accent-[#2D6EAA]"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{c.name}</p>
                                {c.description && <p className="text-xs text-slate-500 truncate">{c.description}</p>}
                              </div>
                            </label>
                          ))}
                          <button
                            onClick={handleImport}
                            disabled={!selectedCourses.length || googleLoading}
                            className="px-6 py-3 bg-[#E95420] text-white rounded-2xl font-black hover:bg-[#c94418] transition-colors disabled:opacity-60 text-sm"
                          >
                            Import {selectedCourses.length} Course{selectedCourses.length !== 1 ? 's' : ''}
                          </button>
                        </div>
                      )}

                      {importResult && (
                        <div className="bg-[#38A169]/10 border border-[#38A169]/20 rounded-2xl p-4">
                          <p className="text-sm font-bold text-[#38A169]">{importResult.message}</p>
                          {importResult.note && <p className="text-xs text-slate-400 mt-1">{importResult.note}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Deep Analytics ── */}
            {tab === 'analytics' && <AnalyticsSection stats={stats} />}

            {/* ── Sales & Revenue ── */}
            {tab === 'sales' && <SalesDashboardSection />}

            {/* ── Payment Management ── */}
            {tab === 'payments' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl sm:text-4xl font-black">Payment Management</h1>
                  <Link 
                    to="/admin/payments" 
                    className="flex items-center gap-2 px-4 py-2 bg-[#E95420] text-white rounded-xl font-bold text-sm hover:bg-[#c94418] transition-colors"
                  >
                    <ExternalLink size={16} />
                    Open Full Dashboard
                  </Link>
                </div>
                
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 sm:p-8">
                  <p className="text-slate-400 mb-4">
                    Manage bank transfer payments, approve pending transactions, and track payment history.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
                      <div className="text-yellow-500 text-sm font-bold mb-1">Pending</div>
                      <div className="text-3xl font-black text-white">-</div>
                    </div>
                    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
                      <div className="text-green-500 text-sm font-bold mb-1">Completed</div>
                      <div className="text-3xl font-black text-white">-</div>
                    </div>
                    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
                      <div className="text-red-500 text-sm font-bold mb-1">Failed</div>
                      <div className="text-3xl font-black text-white">-</div>
                    </div>
                    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
                      <div className="text-blue-500 text-sm font-bold mb-1">Total Revenue</div>
                      <div className="text-3xl font-black text-white">-</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                    <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-300">
                      <p className="font-bold mb-1">Bank Transfer Payment Flow</p>
                      <p className="text-blue-400/80">
                        Customers receive FNB bank details with unique references. 
                        Payments require manual approval after bank confirmation.
                        Click "Open Full Dashboard" to manage all payments.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
