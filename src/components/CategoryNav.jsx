import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Disc2, Cylinder, ArrowDownAZ, Shirt, Gift, Headphones, Newspaper, Contact, Disc3 } from 'lucide-react';

const CategoryNav = () => {
  const { t } = useLanguage();
  const categories = [
    { icon: Newspaper, label: 'News' },
    { icon: Cylinder, label: 'vinyl' },
    { icon: ArrowDownAZ, label: 'cds' },
    { icon: Shirt, label: 'merchandise' },
    { icon: Disc2, label: 'preorders' },
    { icon: Gift, label: 'exclusives' },
    { icon: Headphones, label: 'digital' },
    { icon: Disc3, label: 'releases' }, 
    { icon: Contact, label: 'contact' },

  ];

  return (
    <div className="bg-zinc-800 py-4 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 flex justify-center space-x-8 overflow-x-auto">
        {categories.map(({ icon: Icon, label }) => (
          <a key={label} href="#" className="flex items-center hover:text-red-600 whitespace-nowrap text-white">
            <Icon className="w-5 h-5 mr-2"/>{t(label)}
          </a>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;
