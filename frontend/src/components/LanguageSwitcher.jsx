import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇲🇦' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
            currentLanguage === lang.code
              ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm border border-gray-100 dark:border-slate-800'
              : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
          }`}
        >
          <span className="text-sm">{lang.flag}</span>
          <span className="hidden sm:inline">{lang.label}</span>
          <span className="sm:hidden">{lang.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
