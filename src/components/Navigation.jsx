import DesktopMenu from './DeskTopMenu';
import MobileHeader from './MobileHeader';
import logo from '../assets/logo.jpeg';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-black sticky top-0 z-50">
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
