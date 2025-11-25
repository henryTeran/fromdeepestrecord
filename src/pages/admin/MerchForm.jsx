import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminGuard from '../../components/admin/AdminGuard';
import ImageUploader from '../../components/admin/ImageUploader';
import { adminApi } from '../../services/adminApi';
import { ArrowLeft, Save, Trash2, Plus, X, Loader2 } from 'lucide-react';

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const MerchForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    sizes: [],
    price: 0,
    stock: 0,
    images: [],
    tags: [],
    description: '',
    exclusive: false,
    preorderAt: '',
    seo: {
      title: '',
      description: '',
    },
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchMerch();
    }
  }, [id]);

  const fetchMerch = async () => {
    try {
      setLoading(true);
      const merchDoc = await getDoc(doc(db, 'merch', id));

      if (!merchDoc.exists()) {
        setError('Merch not found');
        return;
      }

      const data = merchDoc.data();
      setFormData({
        ...data,
        preorderAt: data.preorderAt?.toDate?.()?.toISOString().split('T')[0] || '',
        sizes: data.sizes || [],
        tags: data.tags || [],
        images: data.images || [],
        seo: data.seo || { title: '', description: '' },
      });
    } catch (err) {
      console.error('Error fetching merch:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.price || formData.images.length === 0) {
      setError('Title, price, and at least one image are required');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        preorderAt: formData.preorderAt || undefined,
      };

      if (isEdit) {
        await adminApi.merch.update(id, dataToSave);
        alert('Merch updated successfully!');
        navigate('/admin/merch');
      } else {
        const result = await adminApi.merch.create(dataToSave);
        alert('Merch created successfully!');
        navigate('/admin/merch');
      }
    } catch (err) {
      console.error('Error saving merch:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this merch?')) return;

    try {
      await adminApi.merch.delete(id);
      alert('Merch archived successfully!');
      navigate('/admin/merch');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const toggleSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin/merch" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {isEdit ? 'Edit Merchandise' : 'New Merchandise'}
                </h1>
                {isEdit && formData.title && (
                  <p className="text-gray-400 mt-1">{formData.title}</p>
                )}
              </div>
            </div>
            {isEdit && (
              <>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-zinc-800 text-red-400 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Archive
                </button>

                {formData.slug && (
                  <a
                    href={`/product/${formData.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors ml-2"
                  >
                    View on site
                  </a>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-600/10 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-black p-6 rounded-lg space-y-6">
              <h2 className="text-xl font-bold text-white">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (CHF) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pre-order Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.preorderAt}
                    onChange={(e) => setFormData({ ...formData, preorderAt: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sizes
                </label>
                <div className="flex flex-wrap gap-3">
                  {COMMON_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        formData.sizes.includes(size)
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-zinc-800 text-white px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="exclusive"
                  checked={formData.exclusive}
                  onChange={(e) => setFormData({ ...formData, exclusive: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="exclusive" className="text-sm font-medium text-gray-300">
                  Exclusive Item
                </label>
              </div>
            </div>

            <div className="bg-black p-6 rounded-lg space-y-6">
              <h2 className="text-xl font-bold text-white">Images</h2>

              <ImageUploader
                value={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
                label="Product Images *"
                multiple
                maxFiles={10}
              />
            </div>

            <div className="bg-black p-6 rounded-lg space-y-6">
              <h2 className="text-xl font-bold text-white">SEO</h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seo.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, title: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.seo.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, description: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <Link
                to="/admin/merch"
                className="bg-zinc-800 text-white px-6 py-3 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEdit ? 'Update Merch' : 'Create Merch'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
};

export default MerchForm;
