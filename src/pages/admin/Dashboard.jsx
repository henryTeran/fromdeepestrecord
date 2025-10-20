import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Mail, Users, TrendingUp } from 'lucide-react';
import AdminGuard from '../../components/admin/AdminGuard';

const Dashboard = () => {
  const stats = [
    { label: 'Total Releases', value: '0', icon: Package, link: '/admin/releases' },
    { label: 'Merchandise', value: '0', icon: ShoppingBag, link: '/admin/merch' },
    { label: 'Contact Messages', value: '0', icon: Mail, link: '/admin/contact' },
    { label: 'Total Sales', value: 'CHF 0', icon: TrendingUp, link: '/admin/orders' },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
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
