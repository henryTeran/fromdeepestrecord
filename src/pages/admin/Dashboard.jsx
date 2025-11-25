import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Mail, Users, TrendingUp, LogOut, Home } from 'lucide-react';
import AdminGuard from '../../components/admin/AdminGuard';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Releases', value: '...', icon: Package, link: '/admin/releases' },
    { label: 'Merchandise', value: '...', icon: ShoppingBag, link: '/admin/merch' },
    { label: 'Contact Messages', value: '...', icon: Mail, link: '/admin/contact' },
    { label: 'Total Sales', value: '...', icon: TrendingUp, link: '/admin/orders' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Count releases
        const releasesSnap = await getDocs(collection(db, 'releases'));
        const releasesCount = releasesSnap.size;

        // Count merch
        const merchSnap = await getDocs(collection(db, 'merch'));
        const merchCount = merchSnap.size;

        // Count contact messages
        const messagesSnap = await getDocs(collection(db, 'contactMessages'));
        const messagesCount = messagesSnap.size;

        // Count orders and total sales
        const ordersSnap = await getDocs(collection(db, 'orders'));
        let totalSales = 0;
        ordersSnap.forEach(doc => {
          const order = doc.data();
          const grandTotal = order.totals?.grandTotal;
          if (typeof grandTotal === 'number' && !isNaN(grandTotal)) {
            totalSales += grandTotal;
          }
        });

        setStats([
          { label: 'Total Releases', value: releasesCount.toString(), icon: Package, link: '/admin/releases' },
          { label: 'Merchandise', value: merchCount.toString(), icon: ShoppingBag, link: '/admin/merch' },
          { label: 'Contact Messages', value: messagesCount.toString(), icon: Mail, link: '/admin/contact' },
          { label: 'Total Sales', value: `CHF ${(totalSales || 0).toFixed(2)}`, icon: TrendingUp, link: '/admin/orders' },
        ]);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <div className="bg-black border-b border-zinc-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Store</span>
              </Link>
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:inline">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-gray-400">Manage your From Deepest Record store</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  to={stat.link}
                  className="bg-black p-6 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-black p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/admin/releases/new"
                  className="block w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors text-center"
                >
                  Add New Release
                </Link>
                <Link
                  to="/admin/merch/new"
                  className="block w-full bg-zinc-800 text-white px-4 py-3 rounded-lg hover:bg-zinc-700 transition-colors text-center"
                >
                  Add New Merchandise
                </Link>
                <Link
                  to="/admin/contact"
                  className="block w-full bg-zinc-800 text-white px-4 py-3 rounded-lg hover:bg-zinc-700 transition-colors text-center"
                >
                  View Messages
                </Link>
              </div>
            </div>

            <div className="bg-black p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="text-gray-400 text-sm">
                <p>No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default Dashboard;
