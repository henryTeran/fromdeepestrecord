// components/DesktopMenu.jsx
import React from 'react';
import { LanguageSelector } from './LanguageSelector';
import { Search, User, Heart, ShoppingCart, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const DesktopMenu = () => {
  const { t } = useLanguage();
  const favCount = useWishlistStore(state => state.wishlist.length);
  const cart = useCartStore(state => state.cart);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className= "lg:flex items-center space-x-6">

    <LanguageSelector />
    <div className="relative">
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('search')}
        className="bg-zinc-800 text-gray-300 px-4 py-2 pl-10 pr-10 rounded-full focus:outline-none focus:ring-1 focus:ring-red-600 w-64"
        />
      <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery('')}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
    <div className="flex items-center space-x-4">
      <Link to="/account" className="hover:text-red-600 transition-colors text-white">
        <User className="w-5 h-5" />
      </Link>
      <Link to="/wishlist" className="hover:text-red-600 transition-colors flex items-center text-white">
        <Heart className="w-5 h-5" />
        {favCount > 0 && (
          <span className="ml-1 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{favCount}</span>
        )}
      </Link>
      <div className="relative">
        <button 
          onClick={() => setShowCartDropdown(!showCartDropdown)}
          className="hover:text-red-600 transition-colors flex items-center text-white"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="ml-1 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{cartCount}</span>
          )}
        </button>
        
        {/* Cart Dropdown */}
        {showCartDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-black border border-zinc-700 rounded-lg shadow-xl z-50">
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4 text-white">Shopping Cart</h3>
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 bg-zinc-900 p-2 rounded">
                        <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.band}</p>
                          <p className="text-sm text-red-600">{item.quantity} x ${item.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-zinc-700 mt-4 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-white">Total: ${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        to="/cart" 
                        className="flex-1 bg-zinc-800 text-white text-center py-2 rounded hover:bg-zinc-700 transition-colors"
                        onClick={() => setShowCartDropdown(false)}
                      >
                        View Cart
                      </Link>
                      <button className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors">
                        Checkout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
        </div>
    </div>
  );
};

export default DesktopMenu;
