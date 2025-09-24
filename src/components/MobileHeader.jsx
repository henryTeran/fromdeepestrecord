import { Menu, Search, User, Heart, ShoppingCart, X } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import MobileMenu from './MobileMenu';
import { Link } from 'react-router-dom';

const MobileHeader = () => {
  const { t } = useLanguage();
  const favCount = useWishlistStore((state) => state.wishlist.length);
  const cartCount = useCartStore((state) => state.cart.length);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-black/90 backdrop-blur-strong px-4 py-4 border-b border-white/10">
      {/* Top Row: Menu + Logo + Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300 group">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors duration-300">
                FROM DEEPEST
              </span>
              <span className="text-xs text-gray-400 font-medium">
                RECORD
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link 
            to="/account" 
            className="p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            <User className="w-5 h-5 text-white" />
          </Link>
          <Link to="/wishlist" className="relative p-2 rounded-xl hover:bg-white/10 transition-all duration-300">
            <Heart className="w-5 h-5 text-white" />
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold animate-pulse-custom">
                {favCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative p-2 rounded-xl hover:bg-white/10 transition-all duration-300">
            <ShoppingCart className="w-5 h-5 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-semibold animate-pulse-custom">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search')}
          className="input-modern w-full pl-12 pr-12"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {isMenuOpen && <MobileMenu onClose={() => setIsMenuOpen(false)} />}
    </div>
  );
};

export default MobileHeader;