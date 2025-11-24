import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import { Heart, Filter, ChevronDown, Loader, Search } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Head from '../seo/Head';
import { useReleases } from '../hooks/useReleases';
import EmptyState from '../components/EmptyState';

const CategoryPage = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);

  const [filters, setFilters] = useState({
    format: searchParams.get('format') || '',
    genre: searchParams.get('genre') || '',
    country: searchParams.get('country') || '',
    inStock: searchParams.get('inStock') === 'true',
    preOrder: searchParams.get('preOrder') === 'true',
  });

  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);

  const { releases, loading, error, hasMore, lastVisible } = useReleases(
    filters,
    sortBy,
    24,
    lastDoc
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.format) params.set('format', filters.format);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.country) params.set('country', filters.country);
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.preOrder) params.set('preOrder', 'true');
    if (sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params);
  }, [filters, sortBy, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setLastDoc(null);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setLastDoc(null);
  };

  const loadMore = () => {
    if (hasMore && lastVisible) {
      setLastDoc(lastVisible);
    }
  };

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
    return titles[cat] || 'All Releases';
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{getCategoryTitle(category)}</h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="bg-black p-6 rounded-lg mb-8">
            <h3 className="font-bold mb-4 text-white">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm mb-2">Format</label>
                <select
                  value={filters.format}
                  onChange={(e) => handleFilterChange('format', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">All Formats</option>
                  <option value="Vinyl">Vinyl</option>
                  <option value="CD">CD</option>
                  <option value="Cassette">Cassette</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">All Genres</option>
                  <option value="Death Metal">Death Metal</option>
                  <option value="Black Metal">Black Metal</option>
                  <option value="Doom Metal">Doom Metal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">All Countries</option>
                  <option value="Greece">Greece</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Finland">Finland</option>
                  <option value="USA">USA</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.preOrder}
                    onChange={(e) => handleFilterChange('preOrder', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Pre-orders</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => {
                setFilters({
                  format: '',
                  genre: '',
                  country: '',
                  inStock: false,
                  preOrder: false,
                });
                setLastDoc(null);
              }}
              className="mt-4 text-red-600 hover:text-red-500 text-sm"
            >
              {t('clearAllFilters')}
            </button>
          </div>
        )}

        {loading && !lastDoc && (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-8 h-8 animate-spin text-red-600" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-600">Error loading releases</p>
            <p className="text-sm text-gray-400 mt-2">{error.message}</p>
          </div>
        )}

        {!loading && releases.length === 0 && (
          <EmptyState
            icon={Search}
            title={t('noReleasesFound')}
            description={t('noReleasesDesc')}
            actionLabel={t('clearAllFilters')}
            action={() => {
              setFilters({
                format: '',
                genre: '',
                country: '',
                inStock: false,
                preOrder: false,
              });
              setLastDoc(null);
            }}
          />
        )}

        {releases.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {releases.map((release) => {
                const lowestPrice = release.formats && release.formats.length > 0
                  ? Math.min(...release.formats.map(f => f.price))
                  : 0;

                const totalStock = release.formats
                  ? release.formats.reduce((sum, f) => sum + f.stock, 0)
                  : 0;

                const isPreorder = release.preorderAt && new Date(release.preorderAt) > new Date();
                const isLowStock = totalStock > 0 && totalStock <= 5;

                const product = {
                  id: release.id,
                  title: release.title,
                  band: release.artist?.name || 'Unknown Artist',
                  price: lowestPrice,
                  image: release.cover
                };

                return (
                  <div key={release.id} className="group bg-black p-4 rounded-lg hover:bg-zinc-800 transition-colors">
                    <div className="relative mb-4">
                      <img
                        src={release.cover}
                        alt={release.title}
                        className="w-full aspect-square object-cover rounded group-hover:opacity-75 transition-opacity"
                        loading="lazy"
                      />

                      {isPreorder && (
                        <span className="absolute top-2 left-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                          Pre-order
                        </span>
                      )}

                      {isLowStock && !isPreorder && (
                        <span className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                          Low Stock
                        </span>
                      )}

                      <button
                        onClick={() =>
                          isInWishlist(release.id) ? removeFromWishlist(release.id) : addToWishlist(product)
                        }
                        className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-red-600 transition-colors"
                        aria-label={isInWishlist(release.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={`w-4 h-4 ${isInWishlist(release.id) ? 'text-red-600 fill-red-600' : 'text-white'}`} />
                      </button>
                    </div>

                    <Link to={`/release/${release.slug}`} className="block">
                      <h3 className="font-bold text-sm mb-1 group-hover:text-red-600 transition-colors line-clamp-2">
                        {release.title}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">{release.artist?.name}</p>
                    </Link>

                    <div className="flex justify-between items-center">
                      <span className="text-red-600 font-bold">
                        {lowestPrice > 0 ? `CHF ${lowestPrice.toFixed(2)}` : 'N/A'}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                        disabled={totalStock === 0 && !isPreorder}
                      >
                        {totalStock === 0 && !isPreorder ? 'Sold Out' : t("addToCart")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {t('loading')}
                    </>
                  ) : (
                    t('loadMore')
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;
