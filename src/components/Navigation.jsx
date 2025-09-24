import DesktopMenu from './DeskTopMenu';
import MobileHeader from './MobileHeader';
import logo from '../assets/logo.jpeg';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Navigation = () => {
  const { t } = useLanguage();

  return (
    <nav className="bg-black/80 backdrop-blur-strong sticky top-0 z-50 border-b border-white/10">
      {/* Top bar with shipping info */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white py-2 px-4 text-center text-xs font-medium">
        <div className="flex items-center justify-center space-x-4">
          <span className="hidden md:flex items-center">
            <span className="animate-pulse mr-2">🚚</span>
            Free shipping on orders over CHF 75
          </span>
          <span className="hidden md:block">|</span>
          <span className="flex items-center">
            <span className="animate-pulse mr-2">📦</span>
            Fast worldwide delivery
          </span>
        </div>
      </div>
      
      <div className="hidden lg:flex max-w-7xl mx-auto px-6 py-4 justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300 group">
          <div className="relative">
            <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-red-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white group-hover:text-red-400 transition-colors duration-300">
              FROM DEEPEST RECORD
            </span>
            <span className="text-xs text-gray-400 font-medium tracking-wider">
              UNDERGROUND RESISTANCE
            </span>
          </div>
        </Link>
        <DesktopMenu />
      </div>

      {/* Mobile version */}
      <div className="lg:hidden">
        <MobileHeader />
      </div>
    </nav>
  );
};

export default Navigation;