import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, User, Heart, ShoppingCart } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

const MobileMenu = () => {
  const { t } = useLanguage();
  return (
    <div className="lg:hidden bg-black border-b border-zinc-800 p-4">
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <input type="text" placeholder={t('search')} className="w-full bg-zinc-800 text-gray-300 px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-1 focus:ring-red-600"/>
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"/>
        </div>
        <LanguageSelector />
        <a href="#" className="flex items-center hover:text-red-600">
          <User className="w-5 h-5 mr-2"/>{t('account')}
        </a>
        <a href="#" className="flex items-center hover:text-red-600">
          <Heart className="w-5 h-5 mr-2"/>{t('wishlist')}
        </a>
        <a href="#" className="flex items-center hover:text-red-600">
          <ShoppingCart className="w-5 h-5 mr-2"/>{t('cart')} (0)
        </a>
      </div>
    </div>
  );
};

export default MobileMenu;
