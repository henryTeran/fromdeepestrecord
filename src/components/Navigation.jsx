import DesktopMenu from './DeskTopMenu';
import MobileHeader from './MobileHeader';
import logo from '../assets/logo.jpeg';

const Navigation = () => {
  return (
    <nav className="bg-black sticky top-0 z-50">
      <div className="hidden lg:flex max-w-7xl mx-auto px-4 py-3 justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <span className="text-xl font-metal text-white">FROM DEEPEST RECORD!</span>
        </div>
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
