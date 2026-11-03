import { useEffect, useState, useCallback } from 'react';
import { contentApi, type ContentPost, type RichBody } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

type Tab = 'news' | 'guide';

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  readTime: string;
  sortOrder: string;
  featured: boolean;
  published: boolean;
  bodyHtml: string;
}

const EMPTY_FORM: FormState = {
  title: '', slug: '', excerpt: '', imageUrl: '',
  category: '', readTime: '', sortOrder: '0',
  featured: false, published: true,
  bodyHtml: '',
};

function autoSlug(title: string) {
  return title.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminContentPage() {
  const [tab, setTab] = useState<Tab>('news');
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugManual, setSlugManual] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await contentApi.adminListPosts({ type: tab, limit: 100 });
      setPosts(r.posts);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const setField = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(f => {
      const next = { ...f, [field]: value };
      if (field === 'title' && !slugManual) next.slug = autoSlug(String(value));
      return next;
    });
  };

  /** Convert any legacy body format to an HTML string for the editor */
  function legacyToHtml(body: ContentPost['body']): string {
    const b = body as Record<string, unknown>;
    if (typeof (b as RichBody).html === 'string') return (b as RichBody).html;
    // Legacy news: { paragraphs: string[] }
    if (Array.isArray(b.paragraphs)) {
      return (b.paragraphs as string[]).map(p => `<p>${p}</p>`).join('');
    }
    // Legacy guide: { sections: [{ heading, body }] }
    if (Array.isArray(b.sections)) {
      return (b.sections as Array<{ heading: string; body: string[] }>).map(s =>
        `<h2>${s.heading}</h2>` + s.body.map(p => `<p>${p}</p>`).join('')
      ).join('');
    }
    return '';
  }

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSlugManual(false);
    setError(null);
    setShowForm(true);
  };

  const openEdit = async (post: ContentPost) => {
    setEditingId(post.id);
    setError(null);
    const full = await contentApi.adminGetPost(post.id).catch(() => ({ post }));
    const p = full.post;
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      imageUrl: p.imageUrl ?? '',
      category: p.category ?? '',
      readTime: p.readTime ?? '',
      sortOrder: String(p.sortOrder ?? 0),
      featured: p.featured,
      published: p.published,
      bodyHtml: legacyToHtml(p.body),
    });
    setSlugManual(true);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        type: tab,
        title: form.title.trim(),
        slug: form.slug.trim() || autoSlug(form.title),
        excerpt: form.excerpt.trim(),
        imageUrl: form.imageUrl.trim() || null,
        category: form.category.trim() || null,
        readTime: form.readTime.trim() || null,
        sortOrder: parseInt(form.sortOrder) || 0,
        featured: form.featured,
        published: form.published,
        body: { html: form.bodyHtml } as RichBody,
      };
      if (editingId) {
        await contentApi.adminUpdatePost(editingId, payload);
        setSuccess(`${tab === 'news' ? 'Article' : 'Guide'} updated.`);
      } else {
        await contentApi.adminCreatePost(payload as Parameters<typeof contentApi.adminCreatePost>[0]);
        setSuccess(`${tab === 'news' ? 'Article' : 'Guide'} created.`);
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError((err as Error).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await contentApi.adminDeletePost(id);
      load();
    } catch (err: unknown) {
      setError((err as Error).message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage news articles and property guides shown on the site.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + New {tab === 'news' ? 'Article' : 'Guide'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {(['news', 'guide'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'news' ? 'News Articles' : 'Property Guides'}
          </button>
        ))}
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex justify-between">
          {success}
          <button onClick={() => setSuccess(null)}>✕</button>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex justify-between">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            {editingId ? 'Edit' : 'New'} {tab === 'news' ? 'Article' : 'Guide'}
          </h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Title *" value={form.title} onChange={setField('title')} placeholder="Enter title…" />
              </div>
              <div>
                <Input label="Slug (URL)" value={form.slug}
                  onChange={e => { setSlugManual(true); setField('slug')(e); }}
                  placeholder="auto-generated-from-title" />
                <p className="text-xs text-gray-400 mt-1">
                  URL: /{tab === 'news' ? 'news' : 'guides'}/{form.slug || '…'}
                </p>
              </div>
              <Input label="Category" value={form.category} onChange={setField('category')}
                placeholder={tab === 'news' ? 'e.g. Market news' : 'e.g. Buying'} />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt / Summary *</label>
                <textarea value={form.excerpt} onChange={setField('excerpt')} rows={2}
                  placeholder="Short description shown on listing cards and in search results…"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <Input label="Image URL" value={form.imageUrl} onChange={setField('imageUrl')} placeholder="https://…" />
              {tab === 'news' && (
                <Input label="Read time" value={form.readTime} onChange={setField('readTime')} placeholder="e.g. 4 min read" />
              )}
              <Input label="Sort order" type="number" value={form.sortOrder} onChange={setField('sortOrder')} placeholder="0" />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" checked={form.featured} onChange={setField('featured')} className="rounded" />
                Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" checked={form.published} onChange={setField('published')} className="rounded" />
                Published (visible on site)
              </label>
            </div>

            <hr className="border-gray-100" />

            {/* Rich text body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tab === 'news' ? 'Article body' : 'Guide content'}
              </label>
              <RichTextEditor
                value={form.bodyHtml}
                onChange={html => setForm(f => ({ ...f, bodyHtml: html }))}
                placeholder={tab === 'news'
                  ? 'Write the full article here. Use headings, bold, lists…'
                  : 'Write the guide content. Use H2 for section headings, bullet lists for tips…'}
                minHeight={320}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving…' : (editingId ? 'Save changes' : 'Create')}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No {tab === 'news' ? 'articles' : 'guides'} yet.
          <button onClick={openCreate} className="block mt-3 mx-auto text-primary-600 hover:underline text-sm font-medium">
            + Create your first {tab === 'news' ? 'article' : 'guide'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Slug</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                    {post.featured && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">Featured</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{post.category ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs hidden md:table-cell max-w-[180px] truncate">{post.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {post.published ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(post)}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                        className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">
                        {deleting === post.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
