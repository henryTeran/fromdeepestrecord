import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminGuard from '../../components/admin/AdminGuard';
import Table from '../../components/admin/Table';
import { Loader2, X, Eye } from 'lucide-react';
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

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messagesRef = collection(db, 'contactMessages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);

      const items = snapshot.docs
        .filter(doc => {
          // Filtrage côté client
          if (statusFilter !== 'all' && doc.data().status !== statusFilter) {
            return false;
          }
          return true;
        })
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: safeToDate(doc.data().createdAt),
        }));

      setMessages(items);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.contact.updateStatus(id, newStatus);
      fetchMessages();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const columns = [
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            status === 'new'
              ? 'bg-blue-600/20 text-blue-400'
              : status === 'read'
              ? 'bg-green-600/20 text-green-400'
              : 'bg-gray-600/20 text-gray-400'
          }`}
        >
          {status}
        </span>
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject' },
    {
      key: 'message',
      label: 'Message',
      render: (message) => (
        <span className="max-w-xs truncate block">
          {message.substring(0, 50)}...
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (date) => formatDate(date),
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
              <h1 className="text-3xl font-bold text-white mb-2">Contact Messages</h1>
              <p className="text-gray-400">Manage customer inquiries</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="all">All Messages</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <Table
            data={messages}
            columns={columns}
            onView={(message) => setSelectedMessage(message)}
          />

          {selectedMessage && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Message Details</h2>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Name
                      </label>
                      <p className="text-white">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Email
                      </label>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-red-500 hover:text-red-400"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Date
                      </label>
                      <p className="text-white">{formatDate(selectedMessage.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Status
                      </label>
                      <select
                        value={selectedMessage.status}
                        onChange={(e) => {
                          handleStatusChange(selectedMessage.id, e.target.value);
                          setSelectedMessage({ ...selectedMessage, status: e.target.value });
                        }}
                        className="bg-zinc-800 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Subject
                    </label>
                    <p className="text-white text-lg">{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Message
                    </label>
                    <div className="bg-zinc-800 rounded-lg p-4 text-white whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="bg-zinc-800 text-white px-6 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      Close
                    </button>
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
};

export default ContactMessages;
