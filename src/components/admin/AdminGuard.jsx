import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

const AdminGuard = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/account" replace />;
  }

  const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-900 text-gray-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have permission to access the admin panel.</p>
          <a href="/" className="text-red-600 hover:text-red-500">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
