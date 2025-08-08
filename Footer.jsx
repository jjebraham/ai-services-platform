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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">AI Services</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your gateway to premium AI services. Access cutting-edge AI tools and services 
              from leading providers with secure payments and dedicated support.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@aiservices.com</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/services" className="hover:text-primary transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/services?category=language_model" className="hover:text-primary transition-colors">
                  Language Models
                </Link>
              </li>
              <li>
                <Link to="/services?category=image_generation" className="hover:text-primary transition-colors">
                  Image Generation
                </Link>
              </li>
              <li>
                <Link to="/services?category=code_execution" className="hover:text-primary transition-colors">
                  Code Execution
                </Link>
              </li>
              <li>
                <Link to="/services?category=data_analysis" className="hover:text-primary transition-colors">
                  Data Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/dashboard/support" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/dashboard/support" className="hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/docs/api" className="hover:text-primary transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-primary transition-colors">
                  Service Status
                </Link>
              </li>
              <li>
                <Link to="/docs/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/legal/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/cookies" className="hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/compliance" className="hover:text-primary transition-colors">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} AI Services Platform. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Secure payments powered by Stripe</span>
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

