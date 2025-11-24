import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { useWishlistStore } from '../store/wishlistStore';
import { Link } from 'react-router-dom';
import Head from '../seo/Head';
import EmptyState from '../components/EmptyState';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const wishlist = useWishlistStore(state => state.wishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Head
        title="My Wishlist | From Deepest Record"
        description="Your saved underground metal music favorites and wishlist items."
      />
      <Header />
      <Navigation />
      <CategoryNav />
      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-6">Mes Favoris</h1>
        {wishlist.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Start adding your favorite releases to your wishlist"
            actionLabel="Browse Catalog"
            actionLink="/category/releases"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-zinc-900 p-4 rounded-lg">
                <img src={item.image} alt={item.title} className="w-full mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{item.band}</p>
                <p className="text-red-600 mb-2">${item.price.toFixed(2)}</p>
                <div className="flex justify-between items-center">
                  <Link to={`/product/${item.id}`} className="text-sm text-white underline">
                    Voir
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="text-red-500 text-sm"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
       <Footer />
    </div>
  );
};

export default Wishlist;
