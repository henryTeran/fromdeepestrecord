import React, { useState } from 'react';
import { Skull, Menu } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import MobileMenu from './MobileMenu';
import DesktopMenu from './DesktopMenu';
import  logo  from "../assets/logo.jpeg" // Adjust the path as necessary

const Navigation = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="w-20 h-20 mr-2" />
            {/* <Skull className="w-10 h-10 text-red-600" /> */}
            <span className="ml-2 text-2xl font-metal tracking-wider">FROM DEEPEST RECORD!</span>
          </div>
          <DesktopMenu />
          <button className="lg:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
      {showMobileMenu && <MobileMenu />}
    </nav>
  );
};

export default Navigation;
