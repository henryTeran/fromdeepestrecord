import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { categories } from '../data/categories';
import { Link } from 'react-router-dom';

import MobileMenu from './MobileMenu';

const CategoryNav = () => {
  const { t } = useLanguage();

  return (
    
    <div className="bg-zinc-800 py-3 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 flex justify-center space-x-6 overflow-x-auto">
        
        {categories.map(({ icon: Icon, label }) => (
          <Link 
            key={label} 
            to={`/category/${label}`} 
            className="flex items-center text-sm text-white hover:text-red-600 whitespace-nowrap hidden lg:flex transition-colors"
          >
            <Icon className="w-4 h-4 mr-2" />{t(label)}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;
