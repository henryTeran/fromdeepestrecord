import React from "react";
import { Disc2, Heart } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Link } from "react-router-dom";
import { products } from "../data/products";
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

const featuredItems = products.filter((item) => item.category === "featured");

const FeaturedReleases = () => {
  const { t } = useLanguage();
  const addToCart = useCartStore((state) => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);


  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-8 flex items-center border-b border-zinc-700 pb-4">
        <Disc2 className="w-6 h-6 mr-2 text-red-600" />
        {t('featuredReleases')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {featuredItems.map((item) => (
          <div key={item.id} className="group">
            <div className="bg-black p-2 rounded-lg mb-2 relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full aspect-square object-cover rounded group-hover:opacity-75 transition-opacity"
              />
            <button
              onClick={() =>
                isInWishlist(item.id) ? removeFromWishlist(item.id) : addToWishlist(item)
              }
              className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isInWishlist(item.id) ? 'text-red-600' : ''}`} />
            </button>
            </div>
            <Link to={`/product/${item.id}`} className="text-sm font-bold group-hover:text-red-600 transition-colors">
              {item.title}
            </Link>
            <p className="text-xs text-gray-400">{item.band}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-bold">${item.price.toFixed(2)}</span>
              <button
                onClick={() => addToCart(item)}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
              >
                {t("addToCart")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedReleases;