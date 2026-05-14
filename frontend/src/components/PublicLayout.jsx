import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Globe, Share2, Sun, Moon, ShieldCheck, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from '../context/ThemeContext';

const PublicLayout = ({ children }) => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300 relative">
      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-md z-[60] lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`fixed top-0 end-0 h-full w-72 bg-white dark:bg-slate-950 z-[70] lg:hidden transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} border-s border-gray-100 dark:border-slate-800 shadow-2xl`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <span className="font-black text-xl text-primary-600">Menu</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl">
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex flex-col gap-6 flex-1">
            <Link to="/features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors">{t('nav_features')}</Link>
            <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors">{t('nav_pricing')}</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors">{t('nav_about')}</Link>
            <Link to="/security" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-primary-600 transition-colors">{t('nav_security')}</Link>
            <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
              <LanguageSwitcher />
            </div>
          </nav>

          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 mt-auto">
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-center py-4 text-gray-900 dark:text-white font-black">{t('login')}</Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block text-center bg-primary-600 text-white py-4 rounded-2xl font-black mt-2">{t('register')}</Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-gray-50 dark:border-slate-800 py-5 px-6 md:px-10 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary-600 p-1.5 rounded-lg shadow-lg shadow-primary-600/20">
            <Activity className="text-white" size={20} />
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">ClinicFlow</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8">
          <LanguageSwitcher />
          <Link to="/features" className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav_features')}</Link>
          <Link to="/pricing" className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav_pricing')}</Link>
          <Link to="/about" className="text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav_about')}</Link>
          <Link to="/security" className="text-sm font-bold text-primary-600 dark:text-primary-400">{t('nav_security')}</Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
            title={isDarkMode ? "Mode Clair" : "Mode Sombre"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/login" className="text-sm font-black text-gray-900 dark:text-white hover:text-primary-600 transition-colors">{t('login')}</Link>
            <Link to="/register" className="hidden md:block bg-primary-600 text-white px-8 py-3 rounded-xl text-sm font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95">{t('register')}</Link>
          </div>

          <button 
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-gray-500 dark:text-slate-400"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-24 pb-12 px-6 md:px-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-xl">
                <Activity className="text-white" size={24} />
              </div>
              <span className="text-3xl font-black tracking-tight">ClinicFlow</span>
            </Link>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs">
              {t('footer_tagline') || 'La plateforme médicale intelligente au service des patients et des professionnels de santé au Maroc.'}
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-600 transition-all cursor-pointer">
                <Globe size={20} />
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-600 transition-all cursor-pointer">
                <Share2 size={20} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-black mb-8 text-lg uppercase tracking-widest text-slate-500 text-xs">{t('footer_platform')}</h4>
            <ul className="space-y-4 text-slate-300 font-medium">
              <li><Link to="/features" className="hover:text-primary-400 transition-colors">{t('nav_features')}</Link></li>
              <li><Link to="/doctor-directory" className="hover:text-primary-400 transition-colors">{t('nav_doctors')}</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-400 transition-colors">{t('nav_pricing')}</Link></li>
              <li><Link to="/security" className="hover:text-primary-400 transition-colors">{t('nav_security')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-8 text-lg uppercase tracking-widest text-slate-500 text-xs">{t('footer_company')}</h4>
            <ul className="space-y-4 text-slate-300 font-medium">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">{t('nav_about')}</Link></li>
              <li><Link to="/blog" className="hover:text-primary-400 transition-colors">{t('nav_blog')}</Link></li>
              <li><Link to="/careers" className="hover:text-primary-400 transition-colors">{t('nav_careers')}</Link></li>
              <li><Link to="/press" className="hover:text-primary-400 transition-colors">{t('nav_press')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-8 text-lg uppercase tracking-widest text-slate-500 text-xs">{t('footer_support')}</h4>
            <ul className="space-y-4 text-slate-300 font-medium">
              <li><Link to="/help" className="hover:text-primary-400 transition-colors">{t('nav_help')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">{t('nav_contact')}</Link></li>
              <li><Link to="/legal" className="hover:text-primary-400 transition-colors">{t('nav_legal')}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">{t('nav_privacy')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-slate-500">
          <div>
            <p>© 2026 ClinicFlow Maroc. {t('footer_rights')}</p>
            <p className="mt-1 text-slate-600">Powered by BlackCore Tech</p>
          </div>
          <div className="flex gap-8">
             <span className="flex items-center gap-2">
               <ShieldCheck size={14} className="text-green-500" />
               {t('footer_secure_payment')}
             </span>
             <span>{t('footer_cndp')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
