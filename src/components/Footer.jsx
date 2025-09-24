import { useLanguage } from "../contexts/LanguageContext";
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Instagram, Facebook, Music } from 'lucide-react';
import logo from '../assets/logo.jpeg';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl group-hover:scale-110 transition-transform duration-300" />
              <div>
                <span className="text-xl font-bold text-white group-hover:text-red-400 transition-colors duration-300">
                  FROM DEEPEST RECORD
                </span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t('aboutDesc')}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-white/10 rounded-xl hover:bg-gradient-to-r hover:from-pink-500 hover:to-red-500 transition-all duration-300 group"
              >
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-white/10 rounded-xl hover:bg-blue-600 transition-all duration-300 group"
              >
                <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
              </a>
              <a 
                href="https://bandcamp.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-white/10 rounded-xl hover:bg-cyan-600 transition-all duration-300 group"
              >
                <Music className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-3"></div>
              {t('customerService')}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/shipping" 
                  className="text-gray-400 hover:text-red-400 transition-colors duration-300 flex items-center space-x-2 group"
                >
                  <span className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-red-400 transition-colors duration-300"></span>
                  <span>{t('shippingInfo')}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-gray-400 hover:text-red-400 transition-colors duration-300 flex items-center space-x-2 group"
                >
                  <span className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-red-400 transition-colors duration-300"></span>
                  <span>{t('returns')}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-gray-400 hover:text-red-400 transition-colors duration-300 flex items-center space-x-2 group"
                >
                  <span className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-red-400 transition-colors duration-300"></span>
                  <span>{t('privacyPolicy')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-3"></div>
              {t('contact')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{t('adress')}</span>
              </li>
              <li>
                <Link 
                  to="/category/contact" 
                  className="flex items-center space-x-3 text-gray-400 hover:text-red-400 transition-colors duration-300 group"
                >
                  <Mail className="w-5 h-5 text-red-400 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span>support@fromdeepestrecord.com</span>
                </Link>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>+41 22 XXX XX XX</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-3"></div>
              Stay Underground
            </h3>
            <p className="text-gray-400 mb-4 text-sm">
              Get the latest releases and exclusive content delivered to your inbox.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-modern w-full"
              />
              <button className="btn-primary w-full">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 From Deepest Record. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link to="/terms" className="hover:text-red-400 transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-red-400 transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="hover:text-red-400 transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};