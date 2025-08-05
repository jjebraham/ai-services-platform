import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    home: 'Home',
    services: 'Services',
    dashboard: 'Dashboard',
    login: 'Login',
    signup: 'Sign Up',
    payments: 'Online Service Payments',
    toggle: 'FA',
    llmServices: 'LLM Services',
  },
  fa: {
    home: 'خانه',
    services: 'خدمات',
    dashboard: 'داشبورد',
    login: 'ورود',
    signup: 'ثبت‌نام',
    payments: 'پرداخت های ارزی',
    toggle: 'EN',
    llmServices: 'سرویس های LLM',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = (key) => translations[lang][key] || key;
  const toggleLanguage = () => setLang(prev => prev === 'en' ? 'fa' : 'en');
  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
