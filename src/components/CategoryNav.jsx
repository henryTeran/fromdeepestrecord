import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { categories } from '../data/categories';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const CategoryNav = () => {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <div className="bg-black/60 backdrop-blur-sm py-4 sticky top-[120px] z-40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex justify-start md:justify-center gap-3 md:gap-8 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {categories.map(({ icon: Icon, label }) => (
            <Link 
              key={label} 
              to={`/category/${label}`} 
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 group flex-shrink-0 ${
                location.pathname === `/category/${label}` 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
                location.pathname === `/category/${label}` 
                  ? 'text-white' 
                  : 'text-gray-400 group-hover:text-red-400'
              }`} />
              <span className="hidden md:inline text-sm md:text-base">{t(label)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;