import React from "react";
import { Disc2, Heart, ShoppingCart, Star, Loader2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "react-router-dom";
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useReleases } from '../hooks/useReleases';

const FeaturedReleases = () => {
  const { t } = useLanguage();
  const addToCart = useCartStore((state) => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);
  
  // Fetch featured releases from Firebase
  const { releases, loading } = useReleases({}, 'newest', 6);
  
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-black to-zinc-900">
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-black to-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <div className="flex items-center justify-center mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent flex-1 max-w-xs"></div>
            <Disc2 className="w-8 h-8 mx-6 text-red-500 animate-pulse-custom" />
            <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent flex-1 max-w-xs"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text text-glow">
            {t('featuredReleases')}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover our handpicked selection of the most brutal and atmospheric releases
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {releases.slice(0, 6).map((release, index) => {
            const format = release.formats?.[0];
            const price = format?.price || 0;
            const coverImage = release.cover || '/placeholder-vinyl.jpg';
            
            return (
              <div 
                key={release.id} 
                className="card-product group animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <Link to={`/release/${release.slug || release.id}`}>
                    <img
                      src={coverImage}
                      alt={release.title}
                      className="w-full aspect-square object-cover transition-all duration-500 group-hover:scale-110"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </Link>
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-3">
                    <button
                      onClick={() =>
                        isInWishlist(release.id) ? removeFromWishlist(release.id) : addToWishlist(release)
                      }
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-red-500/80 transition-all duration-300 transform hover:scale-110"
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist(release.id) ? 'text-red-400 fill-current' : 'text-white'}`} />
                    </button>
                    <button
                      onClick={() => addToCart({ ...release, price, format: format?.type })}
                      className="p-3 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-110"
                    >
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Featured badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Featured</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link 
                    to={`/release/${release.slug || release.id}`} 
                    className="block mb-2 group-hover:text-red-400 transition-colors duration-300"
                  >
                    <h3 className="font-bold text-white text-lg mb-1 line-clamp-2">
                      {release.title}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium">{release.artist?.name || 'Unknown Artist'}</p>
                  </Link>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-bold gradient-text">
                      CHF {(price || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart({ ...release, price, format: format?.type })}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      {t("addToCart")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link 
            to="/category/releases" 
            className="btn-secondary text-lg px-8 py-4 inline-flex items-center space-x-2 group"
          >
            <span>View All Releases</span>
            <Disc2 className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedReleases;