import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminGuard from '../../components/admin/AdminGuard';
import Table from '../../components/admin/Table';
import { Loader2 } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        const itemsCount = data.items?.length || 0;
        const itemsPreview = data.items?.slice(0, 2).map(item => item.name).join(', ') || 'No items';

        return {
          id: doc.id,
          customer: data.customerEmail || 'Unknown',
          items: itemsCount > 2 ? `${itemsPreview}... (+${itemsCount - 2} more)` : itemsPreview,
          total: `CHF ${data.total?.toFixed(2) || '0.00'}`,
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'
        };
      });

      setOrders(items);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) => {
    // Navigate to order detail page (to be implemented)
    console.log('View order:', id);
  };

  const columns = [
    { key: 'customer', label: 'Customer' },
    { key: 'items', label: 'Items' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Date' }
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
              <p className="text-gray-400">Manage customer orders</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
              Error: {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-black p-12 rounded-lg text-center">
              <p className="text-gray-400 text-lg">No orders yet</p>
            </div>
          ) : (
            <Table
              data={orders}
              columns={columns}
              onEdit={handleView}
              onDelete={null}
            />
          )}
        </div>
      </div>
    </AdminGuard>
  );
};

export default Orders;
