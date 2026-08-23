import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';

export const LanguageSelector = ({ variant = 'default' }) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition">
        <Globe className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select language"
          className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
      <Globe className="w-4 h-4 text-brand-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Select language"
        className="bg-transparent focus:outline-none cursor-pointer font-medium text-sm pr-2"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} - {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
