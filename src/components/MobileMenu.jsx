import { X } from 'lucide-react';
import { categories } from '../data/categories';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const MobileMenu = ({ onClose }) => {
  const { t } = useLanguage();

  return (
    // overlay fond sombre
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80">
      {/* drawer blanc latéral */}
      <div className="w-[80%] sm:w-[300px] h-full bg-black text-white shadow-xl overflow-y-auto">
        {/* header avec bouton fermer */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-200">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* liens */}
        <div className="px-4 py-4 space-y-4">
          {categories.map(({ icon: Icon, label }) => (
            <Link
              key={label}
              to={`/category/${label}`}
              onClick={onClose}
              className="flex items-center text-white hover:text-red-600 border-b border-gray-200 pb-2 transition-colors"
            >
              <Icon className="w-4 h-4 mr-2" />
              {t(label)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
