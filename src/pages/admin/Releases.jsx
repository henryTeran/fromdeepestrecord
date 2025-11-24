import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminGuard from '../../components/admin/AdminGuard';
import Table from '../../components/admin/Table';
import { Plus, Loader2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const safeToDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  return null;
};

const Releases = () => {
  const navigate = useNavigate();
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const releasesRef = collection(db, 'releases');
      const q = query(releasesRef, orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);

      const items = await Promise.all(
        snapshot.docs
          .filter((doc) => {
            // Filtrage côté client pour éviter erreur d'index
            if (!showArchived && doc.data().status === 'archived') {
              return false;
            }
            return true;
          })
          .map(async (doc) => {
            const data = doc.data();
            let artistName = 'Unknown';

            if (data.artistRef) {
              try {
                const artistDoc = await data.artistRef.get();
                if (artistDoc.exists()) {
                  artistName = artistDoc.data().name;
                }
              } catch (err) {
                console.error('Error fetching artist:', err);
              }
            }

            return {
              id: doc.id,
              ...data,
              artistName,
              createdAt: safeToDate(data.createdAt)?.toLocaleDateString() || 'Unknown'
            };
          })
      );

      setReleases(items);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching releases:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  const handleDelete = async (id) => {
    const item = releases.find(r => r.id === id);
    if (!item || !confirm(`Are you sure you want to archive "${item.title}"?`)) {
      return;
    }

    try {
      await adminApi.releases.delete(id, false);
      fetchReleases();
    } catch (err) {
      alert('Error deleting release: ' + err.message);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/releases/${id}/edit`);
  };

  const columns = [
    {
      key: 'cover',
      label: 'Cover',
      render: (value) => (
        <img src={value} alt="" className="w-12 h-12 object-cover rounded" />
      ),
    },
    { key: 'title', label: 'Title' },
    { key: 'artistName', label: 'Artist' },
    { key: 'catno', label: 'Cat#' },
    {
      key: 'formats',
      label: 'Formats',
      render: (formats) => (formats || []).map(f => f.type).join(', '),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            status === 'active'
              ? 'bg-green-600/20 text-green-400'
              : 'bg-gray-600/20 text-gray-400'
          }`}
        >
          {status || 'active'}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-zinc-900 text-gray-300 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Releases</h1>
              <p className="text-gray-400">Manage your music catalog</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="w-4 h-4"
                />
                Show Archived
              </label>
              <Link
                to="/admin/releases/new"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Release
              </Link>
            </div>
          </div>

          <Table
            data={releases}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={(id) => {
              const item = releases.find(r => r.id === id);
              if (item?.slug) navigate(`/release/${item.slug}`);
            }}
          />
        </div>
      </div>
    </AdminGuard>
  );
};

export default Releases;
