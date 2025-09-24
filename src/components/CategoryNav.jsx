import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { categories } from '../data/categories';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import MobileMenu from './MobileMenu';

const CategoryNav = () => {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    
    <div className="bg-zinc-800 py-3 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 flex justify-center space-x-6 overflow-x-auto">
        
        {categories.map(({ icon: Icon, label }) => (
          <Link 
            key={label} 
            to={`/category/${label}`} 
            className={`flex items-center text-sm whitespace-nowrap hidden lg:flex transition-colors ${
              location.pathname === `/category/${label}` 
                ? 'text-red-600 border-b-2 border-red-600 pb-1' 
                : 'text-white hover:text-red-600'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />{t(label)}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;
