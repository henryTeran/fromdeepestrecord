import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import logo from '../assets/logo.jpeg';
import { Link } from 'react-router-dom';
import { Play, Volume2 } from 'lucide-react';

const HeroBanner = () => {
  const { t } = useLanguage();
  
  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 bg-pattern bg-noise">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-red-900/20"></div>
        <img 
          src={logo} 
          alt="Hero banner" 
          className="absolute inset-0 m-auto max-w-md max-h-md object-contain opacity-10 animate-pulse-custom"
        />
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center h-full text-center px-6">
        <div className="max-w-4xl animate-fadeInUp">
          {/* Logo with glow effect */}
          <div className="mb-8 relative">
            <img 
              src={logo} 
              alt="From Deepest Records" 
              className="w-32 h-32 mx-auto rounded-2xl shadow-2xl shadow-red-500/20 animate-glow"
            />
          </div>
          
          {/* Main title */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-shadow">
            <span className="gradient-text text-glow">
              {t('heroTitle')}
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light text-balance max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              to="/category/releases" 
              className="btn-primary text-lg px-8 py-4 flex items-center space-x-3 group"
            >
              <span>{t('shopNow')}</span>
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            
            <button className="btn-secondary text-lg px-8 py-4 flex items-center space-x-3 group">
              <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Listen Now</span>
            </button>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="glass rounded-xl p-4 min-w-[120px]">
              <div className="text-2xl font-bold gradient-text">500+</div>
              <div className="text-sm text-gray-400 font-medium">Releases</div>
            </div>
            <div className="glass rounded-xl p-4 min-w-[120px]">
              <div className="text-2xl font-bold gradient-text">25+</div>
              <div className="text-sm text-gray-400 font-medium">Years</div>
            </div>
            <div className="glass rounded-xl p-4 min-w-[120px]">
              <div className="text-2xl font-bold gradient-text">50+</div>
              <div className="text-sm text-gray-400 font-medium">Countries</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;