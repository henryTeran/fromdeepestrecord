import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminGuard from '../../components/admin/AdminGuard';
import Table from '../../components/admin/Table';
import { Loader2, ArrowLeft } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
          customer: data.shipping.email || data.shipping.name,
          items: itemsCount > 2 ? `${itemsPreview}... (+${itemsCount - 2} more)` : itemsPreview,
          total: `CHF ${(typeof data.totals?.grandTotal === 'number' ? data.totals.grandTotal : 0).toFixed(2)}`,
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
    const order = orders.find(o => o.id === id);
    if (order) {
      setSelectedOrder(order);
    }
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
          {selectedOrder ? (
            <>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white flex items-center gap-2 mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </button>
              
              <div className="bg-zinc-800 rounded-lg p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Order #{selectedOrder.id.slice(-8)}</h1>
                    <p className="text-gray-400">{selectedOrder.createdAt}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedOrder.status === 'paid' ? 'bg-green-600/20 text-green-400' :
                    selectedOrder.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-zinc-900 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Customer Information</h3>
                    <div className="space-y-2 text-gray-300">
                      <p><span className="text-gray-500">Customer:</span> {selectedOrder.customer}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                    <div className="space-y-2 text-gray-300">
                      <p><span className="text-gray-500">Total:</span> {selectedOrder.total}</p>
                      <p><span className="text-gray-500">Status:</span> {selectedOrder.status}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Items</h3>
                  <div className="text-gray-300">
                    <p>{selectedOrder.items}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </AdminGuard>
  );
};

export default Orders;
