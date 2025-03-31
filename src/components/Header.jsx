import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Header = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-red-900 text-white py-2 px-4 text-center text-sm">
      {t('newReleases')}
    </div>
  );
};

export default Header;
