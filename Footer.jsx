import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail } from 'lucide-react';
import { useLanguage } from './LanguageContext';

function Footer() {
  const currentYear = new Date().getFullYear();
  const { toggleLanguage, lang } = useLanguage();

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/kiani-exchange-logo-gray.svg"
                alt="KIANI.EXCHANGE"
                className="h-4"
              />
            </Link>
            <p className="text-sm text-muted-foreground" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
              {lang === 'fa' 
                ? 'دروازه شما به خدمات هوش مصنوعی پرمیوم. دسترسی به ابزارها و خدمات پیشرفته هوش مصنوعی از ارائه‌دهندگان پیشرو با پرداخت‌های امن و پشتیبانی اختصاصی.'
                : 'Your gateway to premium AI services. Access cutting-edge AI tools and services from leading providers with secure payments and dedicated support.'
              }
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@aiservices.com</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
            <h3 className="text-sm font-semibold">
              {lang === 'fa' ? 'خدمات' : 'Services'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'مرور خدمات' : 'Browse Services'}
                </Link>
              </li>
              <li>
                <Link to="/services?category=language_model" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'مدل‌های زبان' : 'Language Models'}
                </Link>
              </li>
              <li>
                <Link to="/services?category=image_generation" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'تولید تصویر' : 'Image Generation'}
                </Link>
              </li>
              <li>
                <Link to="/services?category=code_execution" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'اجرای کد' : 'Code Execution'}
                </Link>
              </li>
              <li>
                <Link to="/services?category=data_analysis" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'تجزیه و تحلیل داده' : 'Data Analysis'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
            <h3 className="text-sm font-semibold">
              {lang === 'fa' ? 'پشتیبانی' : 'Support'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/dashboard/support" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'مرکز راهنما' : 'Help Center'}
                </Link>
              </li>
              <li>
                <Link to="/dashboard/support" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'تماس با پشتیبانی' : 'Contact Support'}
                </Link>
              </li>
              <li>
                <Link to="/docs/api" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'مستندات API' : 'API Documentation'}
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'وضعیت سرویس' : 'Service Status'}
                </Link>
              </li>
              <li>
                <Link to="/docs/faq" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'سوالات متداول' : 'FAQ'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
            <h3 className="text-sm font-semibold">
              {lang === 'fa' ? 'حقوقی' : 'Legal'}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/legal/privacy" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'سیاست حریم خصوصی' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'شرایط خدمات' : 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link to="/legal/cookies" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'سیاست کوکی' : 'Cookie Policy'}
                </Link>
              </li>
              <li>
                <Link to="/legal/compliance" className="hover:text-primary transition-colors">
                  {lang === 'fa' ? 'انطباق' : 'Compliance'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
            <div className="text-sm text-muted-foreground">
              {lang === 'fa' 
                ? `© ${currentYear} پلتفرم خدمات هوش مصنوعی کیانی. تمامی حقوق محفوظ است.`
                : `© ${currentYear} AI Services Platform. All rights reserved.`
              }
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                {lang === 'fa' ? 'پرداخت‌های امن توسط Stripe' : 'Secure payments powered by Stripe'}
              </span>
              <button
                onClick={toggleLanguage}
                className="nav-button lang-button"
              >
                {lang === 'en' ? 'فارسی' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

