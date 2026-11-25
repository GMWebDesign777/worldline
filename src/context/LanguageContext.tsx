import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getTypographyScale,
  TRANSLATIONS,
  type Language,
  type TranslationBundle,
  type TypographyScale,
} from '../i18n/translations';

interface LanguageContextValue {
  lang: Language;
  isKa: boolean;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: TranslationBundle;
  typo: TypographyScale;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('lang');
      if (param === 'ka' || param === 'en') return param;
    }
    return 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'ka' : 'en'));
  const value: LanguageContextValue = {
    lang,
    isKa: lang === 'ka',
    setLang,
    toggleLang,
    t: TRANSLATIONS[lang],
    typo: getTypographyScale(lang),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
