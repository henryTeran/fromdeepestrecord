import DesktopMenu from './DesktopMenu';
import  logo  from "../assets/logo.jpeg" 

const Navigation = () => {
 
  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="w-20 h-20 mr-2" />
            <span className="ml-2 text-2xl font-metal tracking-wider">FROM DEEPEST RECORD!</span>
          </div>
          <DesktopMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
