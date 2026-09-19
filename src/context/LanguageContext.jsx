import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../constants/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('finance_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('finance_language', language);
  }, [language]);

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguageState(lang);
    }
  };

  const t = (key) => {
    if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
      return TRANSLATIONS[language][key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
