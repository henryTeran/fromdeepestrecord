import { Menu, Search, User, Heart, ShoppingCart } from 'lucide-react';
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

  return (
    <div className="lg:hidden bg-black px-4 pt-3 pb-2 border-b border-zinc-800">
      {/* Ligne 1 : logo à gauche, icônes à droite */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Logo" className="w-10 h-10" />
            <span className="text-l font-metal text-white">FROM DEEPEST RECORD!</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/account"><User className="w-5 h-5 text-white" /></Link>
          <Link to="/wishlist" className="relative">
            <Heart className="w-5 h-5 text-white" />
            {favCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
                {favCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-5 h-5 text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Ligne 2 : barre de recherche centrée */}
      <div className="relative">
        <input
          type="text" 
          placeholder={t('search')}
          className="bg-zinc-800 text-gray-300 px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-1 focus:ring-red-600 w-full"
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-600" />
      </div>
      {isMenuOpen && <MobileMenu onClose={() => setIsMenuOpen(false)} />}
    </div>
    
  );
};

export default MobileHeader;
