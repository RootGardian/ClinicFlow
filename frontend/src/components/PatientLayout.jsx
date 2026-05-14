import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Calendar, 
  FileText, 
  UserCircle, 
  LogOut, 
  Activity,
  Bell,
  Upload,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from '../context/ThemeContext';

const PatientLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Search, label: t('find_doctor'), path: '/patient/search' },
    { icon: Sparkles, label: t('ai_assistant_title'), path: '/patient/ai-assistant' },
    { icon: Calendar, label: t('my_appointments'), path: '/patient/appointments' },
    { icon: FileText, label: t('medical_record'), path: '/patient/medical-info' },
    { icon: Upload, label: t('my_documents'), path: '/patient/documents' },
    { icon: UserCircle, label: t('profile'), path: '/patient/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-e border-gray-100 dark:border-slate-800 flex flex-col fixed inset-y-0 start-0 h-full z-20 transition-all duration-300">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Activity className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ClinicFlow</span>
          </Link>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold' 
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 dark:border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all w-full font-medium"
          >
            <LogOut size={20} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ms-64 p-8 transition-all duration-300 min-h-screen">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {menuItems.find(i => i.path === location.pathname)?.label || t('patient')}
            </h1>
            <p className="text-gray-500 dark:text-slate-400">{t('hello')} {user?.first_name} {user?.last_name}</p>
          </div>
          
          <div className="flex items-center gap-4 relative">
            <button
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              title={isDarkMode ? "Mode Clair" : "Mode Sombre"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <LanguageSwitcher />

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 relative transition-all shadow-sm"
              >
                <Bell size={20} />
                <span className="absolute top-3 end-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>

              {showNotifications && (
                <div className="absolute end-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">{t('notifications')}</span>
                    <button className="text-xs text-primary-600 font-bold">{t('mark_all_read')}</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-50 dark:border-slate-800 bg-primary-50/50 dark:bg-primary-900/10">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{t('appointment_confirmed')}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('appointment_validated_msg', { name: 'ClinicFlow' })}</p>
                      <p className="text-[10px] text-primary-600 mt-2 font-bold uppercase">{t('ago_minutes', { count: 10 })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold hover:shadow-md transition-all"
              >
                {user?.first_name[0]}{user?.last_name[0]}
              </button>

              {showProfileMenu && (
                <div className="absolute end-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link to="/patient/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                      <UserCircle size={18} />
                      {t('profile')}
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all">
                      <LogOut size={18} />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PatientLayout;
