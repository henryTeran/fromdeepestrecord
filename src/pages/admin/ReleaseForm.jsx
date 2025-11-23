import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import AdminGuard from '../../components/admin/AdminGuard';
import ImageUploader from '../../components/admin/ImageUploader';
import AutocompleteSelect from '../../components/admin/AutocompleteSelect';
import { adminApi } from '../../services/adminApi';
import { ArrowLeft, Save, Trash2, Sparkles, Plus, X, Loader2 } from 'lucide-react';

const ReleaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    artistRef: '',
    artistName: '',
    labelRef: '',
    labelName: '',
    catno: '',
    barcode: '',
    country: '',
    releaseDate: '',
    preorderAt: '',
    cover: '',
    gallery: [],
    bio: '',
    genres: [],
    styles: [],
    tracks: [],
    formats: [],
    exclusive: false,
    seo: {
      title: '',
      description: '',
    },
  });

  const [newGenre, setNewGenre] = useState('');
  const [newStyle, setNewStyle] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchRelease();
    }
  }, [id]);

  const fetchRelease = async () => {
    try {
      setLoading(true);
      const releaseDoc = await getDoc(doc(db, 'releases', id));

      if (!releaseDoc.exists()) {
        setError('Release not found');
        return;
      }

      const data = releaseDoc.data();

      let artistName = '';
      let labelName = '';

      if (data.artistRef) {
        const artistDoc = await data.artistRef.get();
        if (artistDoc.exists()) {
          artistName = artistDoc.data().name;
        }
      }

      if (data.labelRef) {
        const labelDoc = await data.labelRef.get();
        if (labelDoc.exists()) {
          labelName = labelDoc.data().name;
        }
      }

      setFormData({
        ...data,
        artistRef: data.artistRef?.id || '',
        labelRef: data.labelRef?.id || '',
        artistName,
        labelName,
        releaseDate: data.releaseDate?.toDate?.()?.toISOString().split('T')[0] || '',
        preorderAt: data.preorderAt?.toDate?.()?.toISOString().split('T')[0] || '',
        genres: data.genres || [],
        styles: data.styles || [],
        tracks: data.tracks || [],
        formats: data.formats || [],
        gallery: data.gallery || [],
        seo: data.seo || { title: '', description: '' },
      });
    } catch (err) {
      console.error('Error fetching release:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.cover || formData.formats.length === 0) {
      setError('Title, cover, and at least one format are required');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        artistRef: formData.artistRef || undefined,
        labelRef: formData.labelRef || undefined,
        releaseDate: formData.releaseDate || undefined,
        preorderAt: formData.preorderAt || undefined,
      };

      delete dataToSave.artistName;
      delete dataToSave.labelName;

      if (isEdit) {
        await adminApi.releases.update(id, dataToSave);
        alert('Release updated successfully!');
      } else {
        const result = await adminApi.releases.create(dataToSave);
        alert('Release created successfully!');
        // Retour à la liste pour continuer le workflow d'édition/visualisation
        navigate('/admin/releases');
      }
    } catch (err) {
      console.error('Error saving release:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this release?')) return;

    try {
      await adminApi.releases.delete(id);
      alert('Release archived successfully!');
      navigate('/admin/releases');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEnrich = async () => {
    if (!formData.barcode && (!formData.artistName || !formData.title)) {
      alert('Please provide either a barcode or both artist and title');
      return;
    }

    setEnriching(true);
    try {
      const functions = getFunctions();
      const enrichRelease = httpsCallable(functions, 'enrichRelease');

      const result = await enrichRelease({
        releaseId: id || 'temp',
        artist: formData.artistName,
        title: formData.title,
        barcode: formData.barcode,
      });

      if (result.data.coverUrl) {
        setFormData(prev => ({ ...prev, cover: result.data.coverUrl }));
      }

      if (result.data.country) {
        setFormData(prev => ({ ...prev, country: result.data.country }));
      }

      alert('Metadata enriched successfully!');
    } catch (err) {
      alert('Error enriching: ' + err.message);
    } finally {
      setEnriching(false);
    }
  };

  const addFormat = () => {
    setFormData(prev => ({
      ...prev,
      formats: [
        ...prev.formats,
        {
          sku: '',
          type: 'Vinyl',
          price: 0,
          stock: 0,
          variantColor: '',
          bundle: '',
          description: '',
          exclusive: false,
          limited: false,
          stripePriceId: '',
          preorderAt: '',
        },
      ],
    }));
  };

  const updateFormat = (index, field, value) => {
    const newFormats = [...formData.formats];
    newFormats[index] = { ...newFormats[index], [field]: value };
    setFormData(prev => ({ ...prev, formats: newFormats }));
  };

  const removeFormat = (index) => {
    setFormData(prev => ({
      ...prev,
      formats: prev.formats.filter((_, i) => i !== index),
    }));
  };

  const addTrack = () => {
    setFormData(prev => ({
      ...prev,
      tracks: [...prev.tracks, { position: '', title: '', length: '' }],
    }));
  };

  const updateTrack = (index, field, value) => {
    const newTracks = [...formData.tracks];
    newTracks[index] = { ...newTracks[index], [field]: value };
    setFormData(prev => ({ ...prev, tracks: newTracks }));
  };

  const removeTrack = (index) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index),
    }));
  };

  const addGenre = () => {
    if (newGenre.trim() && !formData.genres.includes(newGenre.trim())) {
      setFormData(prev => ({ ...prev, genres: [...prev.genres, newGenre.trim()] }));
      setNewGenre('');
    }
  };

  const removeGenre = (genre) => {
    setFormData(prev => ({ ...prev, genres: prev.genres.filter(g => g !== genre) }));
  };

  const addStyle = () => {
    if (newStyle.trim() && !formData.styles.includes(newStyle.trim())) {
      setFormData(prev => ({ ...prev, styles: [...prev.styles, newStyle.trim()] }));
      setNewStyle('');
    }
  };

  const removeStyle = (style) => {
    setFormData(prev => ({ ...prev, styles: prev.styles.filter(s => s !== style) }));
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
              <Link to="/admin/releases" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {isEdit ? 'Edit Release' : 'New Release'}
                </h1>
                {isEdit && formData.title && (
                  <p className="text-gray-400 mt-1">{formData.title}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
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
                  <AutocompleteSelect
                    value={formData.artistRef}
                    onChange={(val) => setFormData({ ...formData, artistRef: val })}
                    collection="artists"
                    label="Artist"
                    placeholder="Search artists..."
                  />
                  <input
                    type="text"
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                    placeholder="Or type artist name"
                    className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 mt-2"
                  />
                </div>

                <div>
                  <AutocompleteSelect
                    value={formData.labelRef}
                    onChange={(val) => setFormData({ ...formData, labelRef: val })}
                    collection="labels"
                    label="Label"
                    placeholder="Search labels..."
                  />
                  <input
                    type="text"
                    value={formData.labelName}
                    onChange={(e) => setFormData({ ...formData, labelName: e.target.value })}
                    placeholder="Or type label name"
                    className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Catalog Number
                  </label>
                  <input
                    type="text"
                    value={formData.catno}
                    onChange={(e) => setFormData({ ...formData, catno: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Barcode
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    {isEdit && (
                      <button
                        type="button"
                        onClick={handleEnrich}
                        disabled={enriching}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {enriching ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genres
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-zinc-800 text-white px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {genre}
                      <button
                        type="button"
                        onClick={() => removeGenre(genre)}
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
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                    placeholder="Add genre..."
                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="button"
                    onClick={addGenre}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Styles
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.styles.map((style) => (
                    <span
                      key={style}
                      className="bg-zinc-800 text-white px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {style}
                      <button
                        type="button"
                        onClick={() => removeStyle(style)}
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
                    value={newStyle}
                    onChange={(e) => setNewStyle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStyle())}
                    placeholder="Add style..."
                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="button"
                    onClick={addStyle}
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
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
                  Exclusive Release
                </label>
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

            <div className="bg-black p-6 rounded-lg space-y-6">
              <h2 className="text-xl font-bold text-white">Images</h2>

              <ImageUploader
                value={formData.cover}
                onChange={(url) => setFormData({ ...formData, cover: url })}
                label="Cover Image *"
              />

              <ImageUploader
                value={formData.gallery}
                onChange={(urls) => setFormData({ ...formData, gallery: urls })}
                label="Gallery Images"
                multiple
                maxFiles={10}
              />
            </div>

            <div className="bg-black p-6 rounded-lg space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Formats *</h2>
                <button
                  type="button"
                  onClick={addFormat}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Format
                </button>
              </div>

              {formData.formats.map((format, index) => (
                <div key={index} className="bg-zinc-800 p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Format {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeFormat(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SKU *
                      </label>
                      <input
                        type="text"
                        value={format.sku}
                        onChange={(e) => updateFormat(index, 'sku', e.target.value)}
                        className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type *
                      </label>
                      <select
                        value={format.type}
                        onChange={(e) => updateFormat(index, 'type', e.target.value)}
                        className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        required
                      >
                        <option value="Vinyl">Vinyl</option>
                        <option value="CD">CD</option>
                        <option value="Cassette">Cassette</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Variant Color
                      </label>
                      <input
                        type="text"
                        value={format.variantColor}
                        onChange={(e) => updateFormat(index, 'variantColor', e.target.value)}
                        placeholder="e.g. Black, Clear, Red"
                        className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price (CHF) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={format.price}
                        onChange={(e) => updateFormat(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        value={format.stock}
                        onChange={(e) => updateFormat(index, 'stock', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stripe Price ID
                      </label>
                      <input
                        type="text"
                        value={format.stripePriceId}
                        onChange={(e) => updateFormat(index, 'stripePriceId', e.target.value)}
                        placeholder="price_xxxxx"
                        className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={format.exclusive || false}
                        onChange={(e) => updateFormat(index, 'exclusive', e.target.checked)}
                        className="w-4 h-4"
                      />
                      Exclusive
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={format.limited || false}
                        onChange={(e) => updateFormat(index, 'limited', e.target.checked)}
                        className="w-4 h-4"
                      />
                      Limited Edition
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black p-6 rounded-lg space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Tracklist</h2>
                <button
                  type="button"
                  onClick={addTrack}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Track
                </button>
              </div>

              {formData.tracks.map((track, index) => (
                <div key={index} className="flex gap-4">
                  <input
                    type="text"
                    value={track.position}
                    onChange={(e) => updateTrack(index, 'position', e.target.value)}
                    placeholder="A1"
                    className="w-20 px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <input
                    type="text"
                    value={track.title}
                    onChange={(e) => updateTrack(index, 'title', e.target.value)}
                    placeholder="Track title"
                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <input
                    type="text"
                    value={track.length}
                    onChange={(e) => updateTrack(index, 'length', e.target.value)}
                    placeholder="4:20"
                    className="w-24 px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeTrack(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
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
                to="/admin/releases"
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
                    {isEdit ? 'Update Release' : 'Create Release'}
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

export default ReleaseForm;
