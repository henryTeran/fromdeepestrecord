import { X } from 'lucide-react';
import { categories } from '../data/categories';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const MobileMenu = ({ onClose }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-strong">
      <div className="w-full h-full bg-gradient-to-br from-black via-zinc-900 to-black overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-6 border-b border-white/10">
          <h2 className="font-bold text-xl text-white">Navigation</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-6 py-8 space-y-2">
          {categories.map(({ icon: Icon, label }, index) => (
            <Link
              key={label}
              to={`/category/${label}`}
              onClick={onClose}
              className="flex items-center space-x-4 p-4 rounded-xl text-white hover:bg-white/10 transition-all duration-300 group animate-slideInRight"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-red-500/20 transition-all duration-300">
                <Icon className="w-5 h-5 group-hover:text-red-400 transition-colors duration-300" />
              </div>
              <span className="font-medium group-hover:text-red-400 transition-colors duration-300">
                {t(label)}
              </span>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-white/10 mt-auto">
          <p className="text-gray-400 text-sm text-center">
            © 2025 From Deepest Records
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;