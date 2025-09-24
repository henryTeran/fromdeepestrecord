import React from 'react';
import { Heart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Link } from 'react-router-dom';
import { products } from '../data/products';

const ProductSuggestions = ({ currentProductId, title = "You might also like" }) => {
  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);

  // Get random products excluding current one
  const suggestions = products
    .filter(product => product.id !== currentProductId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  return (
    <div className="bg-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-white">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {suggestions.map((item) => (
            <div key={item.id} className="group">
              <div className="bg-zinc-900 p-2 rounded-lg mb-2 relative">
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
                  <Heart className={`w-4 h-4 ${isInWishlist(item.id) ? 'text-red-600' : 'text-white'}`} />
                </button>
              </div>
              <Link to={`/product/${item.id}`} className="text-sm font-bold group-hover:text-red-600 transition-colors">
                {item.title}
              </Link>
              <p className="text-xs text-gray-400">{item.band}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-bold text-red-600">${item.price.toFixed(2)}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSuggestions;