import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import Head from '../seo/Head';

const Account = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Head
        title="My Account | From Deepest Record"
        description="Login to your From Deepest Record account or create a new account."
      />
      <Header />
      <Navigation />
      <CategoryNav />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">My Account</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Login</h2>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
          <div className="bg-black p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Create Account</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
              >
                Create Account
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