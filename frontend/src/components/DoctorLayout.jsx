import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Wallet, 
  UserCircle, 
  LogOut, 
  Activity,
  Bell,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const DoctorLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/doctor/dashboard' },
    { icon: Calendar, label: t('my_agenda'), path: '/doctor/agenda' },
    { icon: Users, label: t('my_patients'), path: '/doctor/patients' },
    { icon: Wallet, label: t('wallet'), path: '/doctor/wallet' },
    { icon: UserCircle, label: t('profile'), path: '/doctor/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Sidebar Overlay (Mobile only) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-white dark:bg-slate-900 border-e border-gray-100 dark:border-slate-800 flex flex-col fixed inset-y-0 start-0 h-full z-40 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <Activity className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ClinicFlow</span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

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

          <div className="lg:hidden mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">{t('language') || 'Langue'}</p>
            <LanguageSwitcher />
          </div>
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
      <main className="flex-1 lg:ms-64 p-4 md:p-8 transition-all duration-300 min-h-screen">
        {/* Mobile Header Top Bar */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-white dark:bg-slate-950 p-2 -mx-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="text-primary-600" size={20} />
            <span className="font-bold text-gray-900 dark:text-white">ClinicFlow</span>
          </div>
          <div className="w-10"></div>
        </div>

        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {menuItems.find(i => i.path === location.pathname)?.label || t('doctor')}
            </h1>
            <p className="text-gray-500 dark:text-slate-400">{t('welcome_dr')} {user?.first_name} {user?.last_name}</p>
          </div>
          
          <div className="flex items-center gap-4 relative">
            <button
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              title={isDarkMode ? "Mode Clair" : "Mode Sombre"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            
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
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{t('new_appointment_notif')}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('new_notif_msg', { name: 'Sidi Mohamed', time: `${t('tomorrow')} 10:00` })}</p>
                      <p className="text-[10px] text-primary-600 mt-2 font-bold uppercase">{t('ago_minutes', { count: 5 })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
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
                    <Link to="/doctor/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all">
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

export default DoctorLayout;
