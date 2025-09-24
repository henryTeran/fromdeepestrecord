import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import { products } from '../data/products';
import { Heart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Head from '../seo/Head';

const CategoryPage = () => {
  const { category } = useParams();
  const { t } = useLanguage();
  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);

  // Pour cette démo, on affiche tous les produits pour chaque catégorie
  // Dans un vrai site, vous filtrerez par catégorie
  const categoryProducts = products;

  const getCategoryTitle = (cat) => {
    const titles = {
      vinyl: 'Vinyl Records',
      cds: 'Compact Discs',
      tapes: 'Cassette Tapes',
      merchandise: 'Merchandise',
      preorders: 'Pre-orders',
      exclusives: 'Exclusive Releases',
      releases: 'All Releases',
      contact: 'Contact Us'
    };
    return titles[cat] || cat;
  };

  if (category === 'contact') {
    return (
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <Head
          title="Contact Us | From Deepest Record"
          description="Get in touch with From Deepest Record. Contact information and message form."
        />
        <Header />
        <Navigation />
        <CategoryNav />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold">Address</h3>
                  <p className="text-gray-400">Geneva, Switzerland</p>
                </div>
                <div>
                  <h3 className="font-bold">Email</h3>
                  <p className="text-gray-400">contact@fromdeepestrecord.com</p>
                </div>
                <div>
                  <h3 className="font-bold">Business Hours</h3>
                  <p className="text-gray-400">Monday - Friday: 9:00 AM - 6:00 PM CET</p>
                </div>
              </div>
            </div>
            <div className="bg-black p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Send Message</h2>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
                />
                <textarea
                  placeholder="Your Message"
                  rows="4"
                  className="w-full bg-zinc-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-red-600"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
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
        title={`${getCategoryTitle(category)} | From Deepest Record`}
        description={`Browse our collection of ${getCategoryTitle(category).toLowerCase()} from the underground metal scene.`}
      />
      <Header />
      <Navigation />
      <CategoryNav />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">{getCategoryTitle(category)}</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categoryProducts.map((item) => (
            <div key={item.id} className="group bg-black p-4 rounded-lg hover:bg-zinc-800 transition-colors">
              <div className="relative mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full aspect-square object-cover rounded group-hover:opacity-75 transition-opacity"
                />
                <button
                  onClick={() =>
                    isInWishlist(item.id) ? removeFromWishlist(item.id) : addToWishlist(item)
                  }
                  className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(item.id) ? 'text-red-600' : 'text-white'}`} />
                </button>
              </div>
              <Link to={`/product/${item.id}`} className="block">
                <h3 className="font-bold text-sm mb-1 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 mb-2">{item.band}</p>
              </Link>
              <div className="flex justify-between items-center">
                <span className="text-red-600 font-bold">${item.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  {t("addToCart")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;