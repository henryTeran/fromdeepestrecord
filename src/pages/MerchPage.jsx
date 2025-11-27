import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import Head from '../seo/Head';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Heart, ShoppingCart, Truck, Shield, RotateCcw, Loader2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const MerchPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [merch, setMerch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMerch = async () => {
      try {
        setLoading(true);
        const merchDoc = await getDoc(doc(db, 'merch', id));
        
        if (!merchDoc.exists()) {
          setError('Merch item not found');
          setLoading(false);
          return;
        }

        const data = merchDoc.data();
        
        // Extraire les images
        let images = [];
        if (data.images && Array.isArray(data.images)) {
          images = data.images;
        } else if (data.image) {
          images = [data.image];
        } else if (data.cover) {
          images = [data.cover];
        }

        const merchData = {
          id: merchDoc.id,
          name: data.name || data.title || 'Merch Item',
          title: data.name || data.title || 'Merch Item',
          description: data.description || '',
          price: data.price || 0,
          stock: data.stock || 0,
          category: data.category || 'Merch',
          sizes: data.sizes || [],
          images: images,
          cover: images[0] || '',
          brand: data.brand || 'From Deepest Record',
          sku: data.sku || merchDoc.id,
          exclusive: data.exclusive || false,
          seo: data.seo || {}
        };

        setMerch(merchData);
        
        // Sélectionner la première taille disponible
        if (merchData.sizes && merchData.sizes.length > 0) {
          setSelectedSize(merchData.sizes[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching merch:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMerch();
  }, [id]);

  const handleAddToCart = () => {
    if (merch.stock <= 0) return;

    const cartItem = {
      id: merch.id,
      title: merch.name,
      artist: 'Merchandise',
      price: merch.price,
      image: merch.cover,
      sku: merch.sku,
      format: selectedSize || merch.category,
      quantity: quantity,
      isMerch: true
    };

    addToCart(cartItem);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? merch.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === merch.images.length - 1 ? 0 : prev + 1
    );
  };

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

  if (error || !merch) {
    return (
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <Header />
        <Navigation />
        <CategoryNav />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Merch Not Found</h1>
            <p className="text-gray-400 mb-6">{error || 'This item does not exist'}</p>
            <Link to="/category/merchandise" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
              Browse Merchandise
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const canAddToCart = merch.stock > 0;

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Head
        title={`${merch.name} | From Deepest Record`}
        description={merch.seo?.description || merch.description || `${merch.name} - Official merchandise from From Deepest Record`}
        image={merch.cover}
        type="product"
      />

      <Header />
      <Navigation />
      <CategoryNav />

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8 flex items-center gap-2 text-gray-400">
          <Link to="/" className="hover:text-white">Accueil</Link>
          <span>/</span>
          <Link to="/category/merchandise" className="hover:text-white">Merchandise</Link>
          <span>/</span>
          <span className="text-white">{merch.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="relative group bg-white rounded-2xl overflow-hidden aspect-square">
              <img
                src={merch.images[currentImageIndex]}
                alt={merch.name}
                className="w-full h-full object-contain"
                loading="eager"
              />
              
              {merch.exclusive && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                  Exclusif
                </div>
              )}

              {merch.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {merch.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {merch.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-red-600 w-8' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {merch.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {merch.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`bg-white rounded-lg overflow-hidden aspect-square border-2 transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'border-red-600 ring-2 ring-red-600/50' 
                        : 'border-transparent hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${merch.name} - Vue ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">{merch.category}</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                {merch.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <span className="text-sm text-gray-400">(4.8 - 7 avis)</span>
              </div>

              <p className="text-4xl font-bold text-white mb-2">
                {merch.price.toFixed(2)} CHF
              </p>
              
              <p className="text-sm text-gray-400 mb-6">
                Frais d'envoi calculés à la caisse. 5€ offerts dès 50€ d'achat avec le code{' '}
                <span className="text-red-400 font-semibold">METAL50</span>
              </p>
            </div>

            {/* Size Selector */}
            {merch.sizes && merch.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">Taille :</label>
                  <button className="text-sm text-gray-400 hover:text-white underline">
                    Guide des tailles
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {merch.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-lg font-medium transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-red-600 text-white ring-2 ring-red-600/50'
                          : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="text-sm font-semibold text-white mb-3 block">Quantité :</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-zinc-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 bg-zinc-900 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(merch.stock, quantity + 1))}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-400">
                  Plus que {merch.stock} en stock
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-red-600/30"
              >
                <ShoppingCart className="w-6 h-6" />
                {canAddToCart ? 'Ajouter au panier' : 'Rupture de stock'}
              </button>
              
              <button
                onClick={() =>
                  isInWishlist(merch.id) ? removeFromWishlist(merch.id) : addToWishlist(merch)
                }
                className="w-full bg-zinc-800 text-white px-8 py-4 rounded-lg hover:bg-zinc-700 transition-all duration-300 flex items-center justify-center gap-3 font-semibold"
              >
                <Heart className={`w-5 h-5 ${isInWishlist(merch.id) ? 'text-red-600 fill-red-600' : ''}`} />
                {isInWishlist(merch.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </button>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-xl p-6 space-y-4 border border-zinc-700/50">
              <div className="flex items-start gap-4">
                <div className="bg-red-600/20 p-3 rounded-lg">
                  <Truck className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Livraison rapide</h4>
                  <p className="text-sm text-gray-400">Expédition sous 24-48h</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-red-600/20 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Paiement sécurisé</h4>
                  <p className="text-sm text-gray-400">Stripe & PayPal acceptés</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-red-600/20 p-3 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Retours faciles</h4>
                  <p className="text-sm text-gray-400">30 jours pour changer d'avis</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {merch.description && (
              <div className="pt-6 border-t border-zinc-700">
                <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {merch.description}
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="pt-6 border-t border-zinc-700">
              <h3 className="text-lg font-bold text-white mb-3">Détails</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-400">Marque</dt>
                  <dd className="text-white font-semibold">{merch.brand}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Catégorie</dt>
                  <dd className="text-white font-semibold">{merch.category}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Référence</dt>
                  <dd className="text-white font-semibold">{merch.sku}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Stock</dt>
                  <dd className="text-white font-semibold">{merch.stock} disponibles</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Reviews Section Placeholder */}
        <div className="mt-16 border-t border-zinc-700 pt-16">
          <h2 className="text-2xl font-bold text-white mb-8">Avis clients</h2>
          <div className="text-center py-12 bg-zinc-800/50 rounded-xl">
            <p className="text-gray-400">Soyez le premier à donner votre avis</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MerchPage;
