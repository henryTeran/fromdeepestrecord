// components/DesktopMenu.jsx
import React from 'react';
import { LanguageSelector } from './LanguageSelector';
import { Search, User, Heart, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Link } from 'react-router-dom';

const DesktopMenu = () => {
  const { t } = useLanguage();
  const favCount = useWishlistStore(state => state.wishlist.length);
  const cartCount = useCartStore(state => state.cart.length);

  return (
    <div className= "lg:flex items-center space-x-6">

    <LanguageSelector />
    <div className="relative">
      <input 
        type="text" 
        placeholder={t('search')}
        className="bg-zinc-800 text-gray-300 px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-1 focus:ring-red-600 w-64"
        />
      <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
    </div>
    <div className="flex items-center space-x-4">
      <Link to="/account" className="hover:text-red-600 transition-colors text-white">
        <User className="w-5 h-5" />
      </Link>
      <Link to="/wishlist" className="hover:text-red-600 transition-colors flex items-center text-white">
        <Heart className="w-5 h-5" />
        <span className="ml-1 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{favCount}</span>
      </Link>
      <Link to="/cart" className="hover:text-red-600 transition-colors flex items-center text-white">
        <ShoppingCart className="w-5 h-5" />
        <span className="ml-1 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{cartCount}</span>
      </Link>
        </div>
    </div>
  );
};

export default DesktopMenu;
