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
    <div className="flex items-center space-x-8">
      <LanguageSelector />
      
      {/* Search Bar */}
      <div className="relative group">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search')}
          className="input-modern w-80 pl-12 pr-12 transition-all duration-300 focus:w-96"
        />
        <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-red-400 transition-colors duration-300" />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Action Icons */}
      <div className="flex items-center space-x-6">
        <Link to="/account" className="nav-link p-2 rounded-xl hover:bg-white/10 transition-all duration-300">
          <User className="w-6 h-6" />
        </Link>
        
        <Link to="/wishlist" className="nav-link p-2 rounded-xl hover:bg-white/10 transition-all duration-300 relative group">
          <Heart className="w-6 h-6 group-hover:text-red-400 transition-colors duration-300" />
          {favCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full px-2 py-0.5 font-semibold animate-pulse-custom">
              {favCount}
            </span>
          )}
        </Link>
        
        <div className="relative">
          <button 
            onClick={() => setShowCartDropdown(!showCartDropdown)}
            className="nav-link p-2 rounded-xl hover:bg-white/10 transition-all duration-300 relative group"
          >
            <ShoppingCart className="w-6 h-6 group-hover:text-red-400 transition-colors duration-300" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full px-2 py-0.5 font-semibold animate-pulse-custom">
                {cartCount}
              </span>
            )}
          </button>
          
          {/* Enhanced Cart Dropdown */}
          {showCartDropdown && (
            <div className="absolute right-0 mt-4 w-96 glass-dark rounded-2xl shadow-2xl shadow-black/50 z-50 border border-white/20 animate-slideInRight">
              <div className="p-6 bg-gradient-to-b from-zinc-900/95 to-black/95 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Shopping Cart</h3>
                  <button 
                    onClick={() => setShowCartDropdown(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mt-2">Add some metal to your collection!</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 bg-zinc-800/80 p-4 rounded-xl border border-zinc-700/50 hover:bg-zinc-700/80 transition-all duration-300">
                          <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                            <p className="text-xs text-gray-400">{item.band}</p>
                            <p className="text-sm text-red-400 font-semibold">{item.quantity} × ${item.price.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors duration-300 p-1 rounded-lg hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-zinc-700 mt-6 pt-6 bg-zinc-900/50 -mx-6 px-6 pb-6 rounded-b-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-bold text-white">Total</span>
                        <span className="text-2xl font-bold text-red-500">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex space-x-3">
                        <Link 
                          to="/cart" 
                          className="flex-1 btn-secondary text-center py-3"
                          onClick={() => setShowCartDropdown(false)}
                        >
                          View Cart
                        </Link>
                        <button className="flex-1 btn-primary">
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