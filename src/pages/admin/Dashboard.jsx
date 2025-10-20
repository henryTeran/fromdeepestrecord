import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Mail, Users, TrendingUp, LogOut, Home } from 'lucide-react';
import AdminGuard from '../../components/admin/AdminGuard';
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Releases', value: '0', icon: Package, link: '/admin/releases' },
    { label: 'Merchandise', value: '0', icon: ShoppingBag, link: '/admin/merch' },
    { label: 'Contact Messages', value: '0', icon: Mail, link: '/admin/contact' },
    { label: 'Total Sales', value: 'CHF 0', icon: TrendingUp, link: '/admin/orders' },
  ];

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
