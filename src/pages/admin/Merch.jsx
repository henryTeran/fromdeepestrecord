import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminGuard from '../../components/admin/AdminGuard';
import Table from '../../components/admin/Table';
import { Plus, Loader2, ArrowLeft } from 'lucide-react';
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

const Merch = () => {
  const navigate = useNavigate();
  const [merch, setMerch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const fetchMerch = async () => {
    try {
      setLoading(true);
      const merchRef = collection(db, 'merch');
      const q = query(merchRef, orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);

      const items = snapshot.docs
        .filter((doc) => {
          // Filtrage côté client pour éviter erreur d'index
          if (!showArchived && doc.data().status === 'archived') {
            return false;
          }
          return true;
        })
        .map((doc) => {
          const data = doc.data();
          
          // Debug: log the actual data
          console.log('Merch data for', doc.id, ':', data);

          return {
            id: doc.id,
            name: data.name || data.title || 'Untitled',
            category: data.category || 'Merch',
            price: (typeof data.price === 'number' ? data.price : 0).toFixed(2),
            stock: data.stock || 0,
            status: data.status || 'active',
            createdAt: safeToDate(data.createdAt)?.toLocaleDateString() || 'Unknown'
          };
        });

      setMerch(items);
    } catch (err) {
      console.error('Error fetching merch:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this merchandise?')) return;
    
    try {
      await adminApi.deleteMerch(id);
      setMerch(merch.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting merch:', err);
      alert('Failed to delete merchandise');
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/merch/${id}/edit`);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { 
      key: 'price', 
      label: 'Price',
      render: (value) => `CHF ${value}`
    },
    { key: 'stock', label: 'Stock' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          value === 'active' ? 'bg-green-600/20 text-green-400' :
          value === 'archived' ? 'bg-gray-600/20 text-gray-400' :
          'bg-yellow-600/20 text-yellow-400'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'createdAt', label: 'Created' }
  ];

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            to="/admin"
            className="text-gray-400 hover:text-white flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Merchandise</h1>
              <p className="text-gray-400">Manage your store merchandise</p>
            </div>
            <Link
              to="/admin/merch/new"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Merch
            </Link>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="form-checkbox rounded text-red-600"
              />
              Show archived items
            </label>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
              Error: {error}
            </div>
          )}

          <Table
            data={merch}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </AdminGuard>
  );
};

export default Merch;
