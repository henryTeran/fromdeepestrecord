import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { products } from '../data/products';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import ProductSuggestions from '../components/ProductSuggestions';
import ProductSchema from '../seo/ProductSchema';
import { useEnrich } from '../features/catalog/useEnrich';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Heart, ShoppingCart, Truck, Shield, RotateCcw, Play, Clock, MapPin, Disc, Loader2 } from 'lucide-react';

// Test product for demo purposes
const baseProduct = {
  id: "test-001",
  artist: "Burial",
  title: "Untrue",
  barcode: "801061819513",
  price: 29.90,
  stock: 3,
  description: "Seminal dubstep album that redefined electronic music",
  image: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg"
};

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [enrichedData, setEnrichedData] = useState(null);
  
  const { loading, data, error, run } = useEnrich();
  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);

  useEffect(() => {
    // Try to find product in existing data, otherwise use test product
    let foundProduct = products.find(p => p.id === parseInt(id));
    
    if (!foundProduct && id === 'test-001') {
      foundProduct = baseProduct;
    }
    
    if (!foundProduct) {
      foundProduct = {
        ...baseProduct,
        id: id || 'test-001'
      };
    }

    setProduct(foundProduct);

    // Auto-enrich if we don't have cover or detailed metadata
    if (foundProduct && (!foundProduct.cover || !foundProduct.tracks)) {
      run({
        artist: foundProduct.artist || foundProduct.band,
        title: foundProduct.title,
        barcode: foundProduct.barcode
      }).then(enriched => {
        if (enriched) {
          setEnrichedData(enriched);
        }
      });
    }
  }, [id, run]);

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <Header />
        <Navigation />
        <CategoryNav />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
            <Link to="/category/releases" className="btn-primary">
              Browse Releases
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Merge base product with enriched data
  const displayProduct = enrichedData ? {
    ...product,
    cover: enrichedData.cover || product.image,
    tracks: enrichedData.tracks || [],
    label: enrichedData.label || 'From Deepest Record',
    country: enrichedData.country || '',
    date: enrichedData.date || '',
    format: enrichedData.format || 'CD',
    genres: enrichedData.genres || [],
    styles: enrichedData.styles || [],
    catno: enrichedData.catno || product.id
  } : {
    ...product,
    cover: product.image,
    tracks: [],
    label: 'From Deepest Record',
    country: '',
    date: '',
    format: 'CD',
    genres: [],
    styles: [],
    catno: product.id
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <ProductSchema product={displayProduct} />
      <Header />
      <Navigation />
      <CategoryNav />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="relative group">
              {loading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                  <div className="flex items-center space-x-3 text-white">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Enriching metadata...</span>
                  </div>
                </div>
              )}
              <img 
                src={displayProduct.cover} 
                alt={displayProduct.title} 
                className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl shadow-black/50 group-hover:scale-[1.02] transition-all duration-500" 
              />
              {displayProduct.cover !== product.image && (
                <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Enhanced
                </div>
              )}
            </div>
            
            {/* Bandcamp embed placeholder */}
            {displayProduct.links?.bandcamp && (
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2 text-red-400" />
                  Listen
                </h3>
                <iframe
                  src={displayProduct.links.bandcamp}
                  className="w-full h-42 rounded-lg"
                  title="Bandcamp Player"
                />
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white gradient-text">
                {displayProduct.title}
              </h1>
              <h2 className="text-2xl md:text-3xl text-gray-300 mb-6 font-light">
                {displayProduct.artist || displayProduct.band}
              </h2>
              
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {displayProduct.label && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Disc className="w-4 h-4 text-red-400" />
                    <span className="text-gray-400">Label:</span>
                    <span className="text-white font-medium">{displayProduct.label}</span>
                  </div>
                )}
                {displayProduct.date && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-red-400" />
                    <span className="text-gray-400">Released:</span>
                    <span className="text-white font-medium">{displayProduct.date}</span>
                  </div>
                )}
                {displayProduct.country && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span className="text-gray-400">Country:</span>
                    <span className="text-white font-medium">{displayProduct.country}</span>
                  </div>
                )}
                {displayProduct.format && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Disc className="w-4 h-4 text-red-400" />
                    <span className="text-gray-400">Format:</span>
                    <span className="text-white font-medium">{displayProduct.format}</span>
                  </div>
                )}
              </div>

              {/* Genres and Styles */}
              {(displayProduct.genres?.length > 0 || displayProduct.styles?.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {displayProduct.genres?.map(genre => (
                    <span key={genre} className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                      {genre}
                    </span>
                  ))}
                  {displayProduct.styles?.map(style => (
                    <span key={style} className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-sm">
                      {style}
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-3xl md:text-4xl font-bold gradient-text mb-8">
                CHF {displayProduct.price?.toFixed(2)}
              </p>
            </div>
            
            {/* Add to Cart Section */}
            <div className="space-y-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => addToCart(displayProduct)}
                  className="flex-1 btn-primary text-lg py-4 flex items-center justify-center space-x-3"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={() =>
                    isInWishlist(displayProduct.id) ? removeFromWishlist(displayProduct.id) : addToWishlist(displayProduct)
                  }
                  className="btn-secondary py-4 px-6 flex items-center justify-center"
                >
                  <Heart className={`w-6 h-6 ${isInWishlist(displayProduct.id) ? 'text-red-400 fill-current' : ''}`} />
                </button>
              </div>
              
              {/* Product Features */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-red-400" />
                  <span className="text-sm">Free shipping on orders over CHF 75</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-red-400" />
                  <span className="text-sm">Secure payment & buyer protection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-red-400" />
                  <span className="text-sm">30-day return policy</span>
                </div>
              </div>
            </div>
            
            {/* Product Description */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Description</h3>
              <p className="text-gray-300 leading-relaxed">
                {displayProduct.description || `${displayProduct.title} by ${displayProduct.artist || displayProduct.band}. A must-have release for any serious metal collection.`}
              </p>
              
              {displayProduct.catno && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-sm text-gray-400">Catalog Number: </span>
                  <span className="text-sm text-white font-mono">{displayProduct.catno}</span>
                </div>
              )}
            </div>

            {/* Tracklist */}
            {displayProduct.tracks?.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-white">Tracklist</h3>
                <div className="space-y-2">
                  {displayProduct.tracks.map((track, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 text-sm font-mono w-8">
                          {track.position || (index + 1)}
                        </span>
                        <span className="text-white">{track.title}</span>
                      </div>
                      {track.length && (
                        <span className="text-gray-400 text-sm font-mono">
                          {track.length}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">
                  Failed to load additional metadata: {error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ProductSuggestions currentProductId={displayProduct.id} />
      <Footer />
    </div>
  );
};

export default ProductPage;