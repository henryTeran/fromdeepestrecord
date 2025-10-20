import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import Head from '../seo/Head';
import { Loader2, LogOut, User } from 'lucide-react';

const Account = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await signIn(loginData.email, loginData.password);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setLoginError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setLoginError('Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        setLoginError('Invalid email address');
      } else if (err.code === 'auth/too-many-requests') {
        setLoginError('Too many attempts. Please try again later');
      } else {
        setLoginError(err.message);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerData.name.trim()) {
      setRegisterError('Name is required');
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }

    setRegisterLoading(true);

    try {
      await signUp(registerData.email, registerData.password, registerData.name);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setRegisterError('An account with this email already exists');
      } else if (err.code === 'auth/invalid-email') {
        setRegisterError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setRegisterError('Password is too weak');
      } else {
        setRegisterError(err.message);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (user) {
    const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const isAdmin = user.email && adminEmails.includes(user.email);

    return (
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <Head
          title="My Account | From Deepest Record"
          description="Manage your From Deepest Record account."
        />
        <Header />
        <Navigation />
        <CategoryNav />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-black p-8 rounded-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 p-4 rounded-full">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">My Account</h1>
                  <p className="text-gray-400 mt-1">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-t border-zinc-800 pt-6">
                <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <p className="text-white">{user.name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Member Since</label>
                    <p className="text-white">
                      {user.createdAt
                        ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Account Type</label>
                    <p className="text-white">{isAdmin ? 'Admin' : 'Customer'}</p>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="border-t border-zinc-800 pt-6">
                  <h2 className="text-xl font-bold text-white mb-4">Admin Access</h2>
                  <p className="text-gray-400 mb-4">
                    You have admin privileges. Access the admin panel to manage releases,
                    merchandise, and messages.
                  </p>
                  <button
                    onClick={() => navigate('/admin')}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Go to Admin Panel
                  </button>
                </div>
              )}

              <div className="border-t border-zinc-800 pt-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/wishlist')}
                    className="bg-zinc-800 text-white px-4 py-3 rounded-lg hover:bg-zinc-700 transition-colors text-left"
                  >
                    My Wishlist
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="bg-zinc-800 text-white px-4 py-3 rounded-lg hover:bg-zinc-700 transition-colors text-left"
                  >
                    Shopping Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Head
        title="Login | From Deepest Record"
        description="Login to your From Deepest Record account or create a new account."
      />
      <Header />
      <Navigation />
      <CategoryNav />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">My Account</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Login</h2>

            {loginError && (
              <div className="bg-red-600/10 border border-red-600/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>

          <div className="bg-black p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Create Account</h2>

            {registerError && (
              <div className="bg-red-600/10 border border-red-600/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                {registerError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <input
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <input
                type="password"
                placeholder="Password (min. 6 characters)"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                minLength={6}
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
