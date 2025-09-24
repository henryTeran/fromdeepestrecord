import DesktopMenu from './DeskTopMenu';
import MobileHeader from './MobileHeader';
import logo from '../assets/logo.jpeg';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Navigation = () => {
  const { t } = useLanguage();

  return (
    <nav className="bg-black sticky top-0 z-50">
      {/* Top bar with shipping info */}
      <div className="bg-red-900 text-white py-1 px-4 text-center text-xs">
        <span className="hidden md:inline">🚚 Free shipping on orders over $75 | </span>
        <span>📦 Fast worldwide delivery</span>
      </div>
      
      <div className="hidden lg:flex max-w-7xl mx-auto px-4 py-3 justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <span className="text-xl font-metal text-white">FROM DEEPEST RECORD!</span>
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
