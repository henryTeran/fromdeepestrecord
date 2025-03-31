import { useLanguage } from "../contexts/LanguageContext";

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
                <li><a href="#" className="text-gray-400 hover:text-red-600 transition-colors">{t('shippingInfo')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-red-600 transition-colors">{t('returns')}</a></li>
                <li><a href="#" className="text-gray-400 hover:text-red-600 transition-colors">{t('privacyPolicy')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{t('contact')}</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-400">{t('adress')}</li>
                <li><a href="#" className="text-gray-400 hover:text-red-600 transition-colors">support@fromdeppestrecord.com</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{t('followUs')}</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">Bandcamp</a>
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
