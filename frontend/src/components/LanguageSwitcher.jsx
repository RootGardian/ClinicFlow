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
    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentLanguage === lang.code
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="me-1">{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
