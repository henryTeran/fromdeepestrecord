import React from "react";
import { Heart, Calendar, Clock, Zap, Loader2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useCartStore } from "../store/cartStore";
import { Link } from "react-router-dom";
import { useWishlistStore } from "../store/wishlistStore";
import { useReleases } from "../hooks/useReleases";

export const NewArrivals = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);
  const { t } = useLanguage();
  
  // Fetch latest releases from Firebase
  const { releases, loading } = useReleases({}, 'newest', 6);
  
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-zinc-900 to-black">
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-zinc-900 to-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12 animate-fadeInUp">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {t("newArrivals")}
              </h2>
              <p className="text-gray-400">Fresh from the underground</p>
            </div>
          </div>
          <Link 
            to="/category/releases" 
            className="hidden md:flex btn-secondary px-6 py-3 items-center space-x-2 group"
          >
            <span>View All</span>
            <Zap className="w-4 h-4 group-hover:text-yellow-400 transition-colors duration-300" />
          </Link>
        </div>

        {/* Products List */}
        <div className="space-y-6">
          {releases.slice(0, 6).map((release, index) => (
            <div
              key={release.id}
              className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group animate-slideInRight"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <img
                    src={release.cover}
                    alt={release.title}
                    className="w-full md:w-32 h-32 object-cover rounded-xl transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>New</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/release/${release.slug}`} 
                    className="block group-hover:text-red-400 transition-colors duration-300"
                  >
                    <h3 className="text-xl font-bold text-white mb-1 truncate">
                      {release.title}
                    </h3>
                    <p className="text-gray-400 font-medium mb-3">{release.artist?.name || 'Unknown Artist'}</p>
                  </Link>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
                      {release.genre || 'Extreme Metal'}
                    </span>
                    {release.formats && release.formats.length > 0 && (
                      <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-xs">
                        {release.formats[0].type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between items-end space-y-4">
                  <span className="text-2xl font-bold gradient-text">
                    CHF {release.formats?.[0]?.price?.toFixed(2) || '0.00'}
                  </span>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        isInWishlist(release.id) ? removeFromWishlist(release.id) : addToWishlist(release)
                      }
                      className="p-3 bg-white/10 rounded-xl hover:bg-red-500/20 transition-all duration-300 group/btn"
                    >
                      <Heart className={`w-5 h-5 transition-all duration-300 ${
                        isInWishlist(release.id) 
                          ? 'text-red-400 fill-current' 
                          : 'text-gray-400 group-hover/btn:text-red-400'
                      }`} />
                    </button>
                    <button
                      onClick={() => addToCart(release)}
                      className="btn-primary px-6 py-3 flex items-center space-x-2"
                    >
                      <span>{t("addToCart")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-12 md:hidden">
          <Link 
            to="/category/releases" 
            className="btn-primary px-8 py-4 inline-flex items-center space-x-2"
          >
            <span>View All New Arrivals</span>
            <Zap className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};