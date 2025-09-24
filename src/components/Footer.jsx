import { useLanguage } from "../contexts/LanguageContext";
import { Link } from 'react-router-dom';

export const Footer = () => {
    const { t } = useLanguage();

     return (
        <footer className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">{t('about')}</h3>
              <p className="text-sm text-gray-400">{t('aboutDesc')}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{t('customerService')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/shipping" className="text-gray-400 hover:text-red-600 transition-colors">{t('shippingInfo')}</Link></li>
                <li><Link to="/returns" className="text-gray-400 hover:text-red-600 transition-colors">{t('returns')}</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-red-600 transition-colors">{t('privacyPolicy')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{t('contact')}</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-400">{t('adress')}</li>
                <li><Link to="/category/contact" className="text-gray-400 hover:text-red-600 transition-colors">support@fromdeppestrecord.com</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{t('followUs')}</h3>
              <div className="flex space-x-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors">Instagram</a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors">Facebook</a>
                <a href="https://bandcamp.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors">Bandcamp</a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-sm text-gray-400">
            © 2025 From Deepest Record! All rights reserved.
          </div>
        </div>
      </footer>
     ); 
};
