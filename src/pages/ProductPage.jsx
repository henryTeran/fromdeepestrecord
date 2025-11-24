import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import VariantSelector from '../components/VariantSelector';
import Head from '../seo/Head';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Heart, ShoppingCart, Truck, Shield, RotateCcw, Loader2, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ProductPage = () => {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedReleases, setRelatedReleases] = useState([]);

  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        setLoading(true);

        const releasesRef = collection(db, 'releases');
        const q = query(releasesRef, where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setError('Release not found');
          setLoading(false);
          return;
        }

        const releaseDoc = snapshot.docs[0];
        const releaseData = { id: releaseDoc.id, ...releaseDoc.data() };

        if (releaseData.artistRef) {
          const artistDoc = await getDoc(releaseData.artistRef);
          if (artistDoc.exists()) {
            releaseData.artist = { id: artistDoc.id, ...artistDoc.data() };
          }
        }

        if (releaseData.labelRef) {
          const labelDoc = await getDoc(releaseData.labelRef);
          if (labelDoc.exists()) {
            releaseData.label = { id: labelDoc.id, ...labelDoc.data() };
          }
        }

        setRelease(releaseData);

        if (releaseData.formats && releaseData.formats.length > 0) {
          const defaultVariant = releaseData.formats.find(f => f.stock > 0) || releaseData.formats[0];
          setSelectedVariant(defaultVariant);
        }

        if (releaseData.labelRef) {
          const relatedQuery = query(
            collection(db, 'releases'),
            where('labelRef', '==', releaseData.labelRef),
            limit(5)
          );
          const relatedSnapshot = await getDocs(relatedQuery);
          const related = relatedSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(r => r.id !== releaseData.id)
            .slice(0, 4);
          setRelatedReleases(related);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching release:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRelease();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <Header />
        <Navigation />
        <CategoryNav />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !release) {
    return (
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <Header />
        <Navigation />
        <CategoryNav />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Release Not Found</h1>
            <p className="text-gray-400 mb-6">{error || 'This release does not exist'}</p>
            <Link to="/category/releases" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
              Browse Releases
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || 0;
  const currentStock = selectedVariant?.stock || 0;
  const isPreorder = selectedVariant?.preorderAt && new Date(selectedVariant.preorderAt) > new Date();
  const canAddToCart = currentStock > 0 || isPreorder;

  const handleAddToCart = () => {
    if (!canAddToCart || !selectedVariant) return;

    const cartItem = {
      id: release.id,
      title: release.title,
      artist: release.artist?.name || 'Unknown Artist',
      price: selectedVariant.price,
      image: release.cover,
      sku: selectedVariant.sku,
      format: selectedVariant.type,
      stripePriceId: selectedVariant.stripePriceId,
      quantity: 1,
    };

    addToCart(cartItem);
  };

  const wishlistItem = {
    id: release.id,
    title: release.title,
    artist: release.artist?.name,
    price: currentPrice,
    image: release.cover,
  };

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'tracklist', label: 'Tracklist', hidden: !release.tracks || release.tracks.length === 0 },
    { id: 'details', label: 'Details' },
    { id: 'shipping', label: 'Shipping' },
  ].filter(tab => !tab.hidden);

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Head
        title={`${release.artist?.name || 'Unknown'} — ${release.title} | From Deepest Record`}
        description={release.seo?.description || release.bio || `${release.title} by ${release.artist?.name}. Underground metal music.`}
        image={release.cover}
        type="product"
      />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": release.title,
          "description": release.seo?.description || release.bio,
          "image": release.cover,
          "brand": {
            "@type": "Brand",
            "name": release.label?.name || "From Deepest Record"
          },
          "offers": {
            "@type": "AggregateOffer",
            "lowPrice": release.formats ? Math.min(...release.formats.map(f => f.price)) : currentPrice,
            "priceCurrency": "CHF",
            "availability": currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin },
            { "@type": "ListItem", "position": 2, "name": "Releases", "item": `${window.location.origin}/category/releases` },
            { "@type": "ListItem", "position": 3, "name": release.title }
          ]
        })}
      </script>

      <Header />
      <Navigation />
      <CategoryNav />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="relative group">
              <img
                src={release.cover}
                alt={release.title}
                className="w-full aspect-square object-cover rounded-lg shadow-2xl"
                loading="eager"
              />
              {isPreorder && (
                <div className="absolute top-4 left-4 bg-yellow-600 text-white px-3 py-1 rounded-lg font-bold">
                  Pre-order
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                {release.title}
              </h1>
              <Link
                to={`/artist/${release.artist?.slug}`}
                className="text-xl sm:text-2xl text-gray-300 hover:text-red-600 transition-colors"
              >
                {release.artist?.name || 'Unknown Artist'}
              </Link>

              {release.label && (
                <div className="mt-4">
                  <Link
                    to={`/label/${release.label?.slug}`}
                    className="text-sm text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {release.label.name}
                  </Link>
                </div>
              )}
            </div>

            <div className="text-3xl font-bold text-red-600">
              CHF {currentPrice.toFixed(2)}
            </div>

            {release.formats && release.formats.length > 0 && (
              <VariantSelector
                formats={release.formats}
                selectedSku={selectedVariant?.sku}
                onSelectVariant={setSelectedVariant}
              />
            )}

            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="flex-1 bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {canAddToCart ? 'Add to Cart' : 'Sold Out'}
                </button>
                <button
                  onClick={() =>
                    isInWishlist(release.id) ? removeFromWishlist(release.id) : addToWishlist(wishlistItem)
                  }
                  className="bg-zinc-800 text-white px-6 py-4 rounded-lg hover:bg-zinc-700 transition-colors"
                  aria-label={isInWishlist(release.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(release.id) ? 'text-red-600 fill-red-600' : ''}`} />
                </button>
              </div>

              {isPreorder && selectedVariant?.preorderAt && (
                <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-bold">
                      Ships on {new Date(selectedVariant.preorderAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-black/40 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-5 h-5 text-red-600" />
                  <span>Free shipping on orders over CHF 75</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span>Secure payment with Stripe</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="w-5 h-5 text-red-600" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="border-b border-zinc-800 mb-6">
            <div className="flex gap-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 font-bold transition-colors ${
                    activeTab === tab.id
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-6">
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {release.bio || release.seo?.description || 'No description available.'}
                </p>
              </div>
            )}

            {activeTab === 'tracklist' && release.tracks && (
              <div className="space-y-2">
                {release.tracks.map((track, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-b-0">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 font-mono text-sm w-8">
                        {track.position || (index + 1)}
                      </span>
                      <span className="text-white">{track.title}</span>
                    </div>
                    {track.length && (
                      <span className="text-gray-400 font-mono text-sm">
                        {track.length}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-2 gap-4">
                {release.catno && (
                  <div>
                    <div className="text-gray-500 text-sm">Catalog Number</div>
                    <div className="text-white font-mono">{release.catno}</div>
                  </div>
                )}
                {release.barcode && (
                  <div>
                    <div className="text-gray-500 text-sm">Barcode</div>
                    <div className="text-white font-mono">{release.barcode}</div>
                  </div>
                )}
                {release.country && (
                  <div>
                    <div className="text-gray-500 text-sm">Country</div>
                    <div className="text-white">{release.country}</div>
                  </div>
                )}
                {release.releaseDate && (
                  <div>
                    <div className="text-gray-500 text-sm">Release Date</div>
                    <div className="text-white">
                      {new Date(release.releaseDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {release.genres && release.genres.length > 0 && (
                  <div className="col-span-2">
                    <div className="text-gray-500 text-sm mb-2">Genres</div>
                    <div className="flex flex-wrap gap-2">
                      {release.genres.map(genre => (
                        <span key={genre} className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {release.styles && release.styles.length > 0 && (
                  <div className="col-span-2">
                    <div className="text-gray-500 text-sm mb-2">Styles</div>
                    <div className="flex flex-wrap gap-2">
                      {release.styles.map(style => (
                        <span key={style} className="bg-zinc-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <p className="text-gray-300">
                  We ship worldwide from Geneva, Switzerland using Swiss Post and DHL.
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="font-bold text-white mb-1">Switzerland</div>
                    <div className="text-gray-400 text-sm">CHF 8.00 - Delivery in 2-3 business days</div>
                  </div>
                  <div>
                    <div className="font-bold text-white mb-1">Europe</div>
                    <div className="text-gray-400 text-sm">CHF 15.00 - Delivery in 5-7 business days</div>
                  </div>
                  <div>
                    <div className="font-bold text-white mb-1">Rest of World</div>
                    <div className="text-gray-400 text-sm">CHF 25.00 - Delivery in 7-14 business days</div>
                  </div>
                  <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4 mt-4">
                    <div className="text-green-600 font-bold">Free Shipping</div>
                    <div className="text-gray-300 text-sm">On all orders over CHF 75</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedReleases.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">From the same label</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedReleases.map(related => (
                <Link
                  key={related.id}
                  to={`/release/${related.slug}`}
                  className="group"
                >
                  <div className="bg-black rounded-lg p-4 hover:bg-zinc-800 transition-colors">
                    <img
                      src={related.cover}
                      alt={related.title}
                      className="w-full aspect-square object-cover rounded mb-3 group-hover:opacity-75 transition-opacity"
                      loading="lazy"
                    />
                    <h3 className="font-bold text-sm text-white mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-400">{related.artist?.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductPage;
