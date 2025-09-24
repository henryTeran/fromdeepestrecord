import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import logo from '../assets/logo.jpeg';
import { Link } from 'react-router-dom';

const HeroBanner = () => {
  const { t } = useLanguage();
  return (
    <div className="relative h-[600px] bg-black">
      <img src={logo} alt="Hero banner" className="absolute inset-0 m-auto max-w-full max-h-full object-contain opacity-40"/>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-metal text-white mb-4">{t('heroTitle')}</h1>
          <p className="text-xl text-gray-300 mb-8">{t('heroSubtitle')}</p>
          <Link 
            to="/category/releases" 
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors text-lg"
          >
            {t('shopNow')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
