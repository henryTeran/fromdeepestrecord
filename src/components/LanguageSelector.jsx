import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Flag from 'react-world-flags';

const languages = [
  { value: 'en', flag: 'US' },
  { value: 'es', flag: 'ES' },
  { value: 'fr', flag: 'FR' },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentFlag = languages.find((lang) => lang.value === language)?.flag;

  return (
    <div className="relative inline-block text-right">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-zinc-800 px-3 py-1 rounded text-white flex items-center hover:bg-zinc-700 focus:outline-none"
      >
        <Flag code={currentFlag} className="h-5 w-7 rounded-sm" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-20 bg-zinc-800 rounded shadow-lg z-50">
          {languages.map(({ value, flag }) => (
            <button
              key={value}
              className="block w-full text-center px-2 py-1 hover:bg-zinc-700 focus:outline-none"
              onClick={() => {
                setLanguage(value);
                setOpen(false);
              }}
            >
              <Flag code={flag} className="h-5 w-7 rounded-sm mx-auto" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
