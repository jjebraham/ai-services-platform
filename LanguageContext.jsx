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
    heroBadge: '⚡ Trusted by 10,000+ users worldwide',
    heroTitle: 'Access Premium AI Services with Confidence',
    heroDescription: 'Your gateway to cutting-edge AI tools and services. Secure payments, verified providers, and dedicated support for all your AI needs.',
    goToDashboard: 'Go to Dashboard →',
    getStarted: 'Get Started Free →',
    browseServices: 'Browse Services',
    statsActiveUsers: 'Active Users',
    statsAIServices: 'AI Services',
    statsCountries: 'Countries',
    statsUptime: 'Uptime',
    whyChooseTitle: 'Why Choose Our Platform?',
    whyChooseDescription: 'We provide a secure, reliable, and user-friendly platform for accessing premium AI services from around the world.',
    featureSecureTitle: 'Secure & Verified',
    featureSecureDesc: 'KYC verification and secure payment processing ensure your safety and compliance.',
    featurePricingTitle: 'Real-time Pricing',
    featurePricingDesc: 'Live USD to Toman conversion with transparent pricing and no hidden fees.',
    featureSupportTitle: '24/7 Support',
    featureSupportDesc: 'Dedicated customer support team ready to help you with any questions.',
    featurePremiumTitle: 'Premium Services',
    featurePremiumDesc: 'Access to cutting-edge AI services from leading providers worldwide.',
    ctaTitle: 'Ready to Get Started?',
    ctaDescription: 'Join thousands of users who trust our platform for their AI service needs. Start your journey today with our secure and reliable platform.',
    ctaGoDashboard: 'Go to Dashboard →',
    ctaCreateAccount: 'Create Free Account →',
    ctaSignIn: 'Sign In',
    ctaNoSetup: '✓ No setup fees',
    ctaSecurePayments: '✓ Secure payments',
    ctaSupport: '✓ 24/7 support',
    serviceNotFound: 'Service not found',
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
    heroBadge: '⚡ مورد اعتماد بیش از ۱۰٬۰۰۰ کاربر در سراسر جهان',
    heroTitle: 'با اطمینان به خدمات پریمیوم هوش مصنوعی دسترسی پیدا کنید',
    heroDescription: 'دروازه شما به ابزارها و خدمات پیشرفته هوش مصنوعی. پرداخت امن، ارائه‌دهندگان تایید شده و پشتیبانی اختصاصی برای تمام نیازهای شما.',
    goToDashboard: 'رفتن به داشبورد →',
    getStarted: 'شروع رایگان →',
    browseServices: 'مشاهده خدمات',
    statsActiveUsers: 'کاربران فعال',
    statsAIServices: 'خدمات هوش مصنوعی',
    statsCountries: 'کشورها',
    statsUptime: 'پایداری',
    whyChooseTitle: 'چرا پلتفرم ما؟',
    whyChooseDescription: 'ما پلتفرمی امن، قابل اعتماد و کاربرپسند برای دسترسی به خدمات پریمیوم هوش مصنوعی از سراسر جهان فراهم می‌کنیم.',
    featureSecureTitle: 'امن و تایید شده',
    featureSecureDesc: 'تایید هویت KYC و پردازش پرداخت امن، امنیت و انطباق شما را تضمین می‌کند.',
    featurePricingTitle: 'قیمت‌گذاری لحظه‌ای',
    featurePricingDesc: 'تبدیل زنده دلار به تومان با قیمت شفاف و بدون هزینه پنهان.',
    featureSupportTitle: 'پشتیبانی ۲۴/۷',
    featureSupportDesc: 'تیم پشتیبانی اختصاصی آماده پاسخگویی به هرگونه سوال شماست.',
    featurePremiumTitle: 'خدمات پریمیوم',
    featurePremiumDesc: 'دسترسی به جدیدترین خدمات هوش مصنوعی از ارائه‌دهندگان برتر جهان.',
    ctaTitle: 'آماده شروع هستید؟',
    ctaDescription: 'به هزاران کاربری بپیوندید که برای نیازهای خدمات هوش مصنوعی خود به پلتفرم ما اعتماد دارند. همین امروز با پلتفرم امن و قابل اعتماد ما شروع کنید.',
    ctaGoDashboard: 'رفتن به داشبورد →',
    ctaCreateAccount: 'ایجاد حساب رایگان →',
    ctaSignIn: 'ورود',
    ctaNoSetup: '✓ بدون هزینه راه‌اندازی',
    ctaSecurePayments: '✓ پرداخت امن',
    ctaSupport: '✓ پشتیبانی ۲۴/۷',
    serviceNotFound: 'سرویس یافت نشد',
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
