import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Wallet, Video, Clock, CheckCircle, AlertCircle, Trash2, ArrowUpRight } from 'lucide-react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/LoadingSpinner';

import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://clinicflow-backend-wi33.onrender.com';
  return url.replace('/api', '');
};
const socket = io(getSocketUrl());

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [wallet, setWallet] = useState({ totalEarnings: 0, currency: 'MAD' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [appRes, walletRes] = await Promise.all([
        api.get('/doctor/appointments'),
        api.get('/doctor/wallet')
      ]);
      setAppointments(appRes.data);
      setWallet(walletRes.data);
    } catch (err) {
      console.error("Erreur lors de la récupération du dashboard:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();

    socket.on('prescription_generated', (data) => {
      fetchDashboardData();
    });

    return () => {
      socket.off('prescription_generated');
    };
  }, []);

  const confirmedApps = appointments.filter(a => a.status === 'confirmed');
  const completedApps = appointments.filter(a => a.status === 'completed');
  const pendingApps = appointments.filter(a => a.status === 'pending');
  
  const stats = [
    { 
      label: t('next_appointment'), 
      value: confirmedApps[0]?.appointment_date ? new Date(confirmedApps[0].appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--', 
      icon: Video, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50 dark:bg-blue-900/20' 
    },
    { 
      label: t('total_appointments'), 
      value: appointments.length.toString(), 
      icon: Calendar, 
      color: 'text-primary-600 dark:text-primary-400', 
      bg: 'bg-primary-50 dark:bg-primary-900/20' 
    },
    { 
      label: t('available_balance') || 'Solde Disponible', 
      value: `${wallet.totalEarnings.toLocaleString()} ${wallet.currency || 'MAD'}`, 
      icon: Wallet, 
      color: 'text-green-600 dark:text-green-400', 
      bg: 'bg-green-50 dark:bg-green-900/20' 
    },
    { 
      label: t('pending_earnings') || 'Gains en attente', 
      value: `${(wallet.pendingEarnings || 0).toLocaleString()} ${wallet.currency || 'MAD'}`, 
      icon: Clock, 
      color: 'text-orange-600 dark:text-orange-400', 
      bg: 'bg-orange-50 dark:bg-orange-900/20' 
    },
  ];

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/doctor/appointments/${id}/status`, { status: newStatus });
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm(t('confirm_delete_appointment'))) {
      try {
        await api.delete(`/doctor/appointments/${id}`);
        setAppointments(prev => prev.filter(app => app.id !== id));
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      }
    }
  };

  if (loading) return <LoadingSpinner text={t('loading')} />;

  return (
    <div className="space-y-10 pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-gray-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Prochains Rendez-vous */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{t('today_consultations')}</h3>
            <button className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              {t('see_all')} <ArrowUpRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-16 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-800 text-center">
                <Calendar className="mx-auto text-gray-200 dark:text-slate-800 mb-6" size={48} />
                <p className="text-gray-400 dark:text-slate-500 font-bold">{t('no_appointments')}</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {appointments.slice(0, 5).map((app, i) => (
                  <motion.div 
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
                  >
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-600/20">
                        {app.patient.user.first_name[0]}{app.patient.user.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                          {app.patient.user.first_name} {app.patient.user.last_name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 font-medium">
                            <Calendar size={12} className="text-primary-500" />
                            {new Date(app.appointment_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 font-medium">
                            <Clock size={12} className="text-primary-500" />
                            {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        app.status === 'confirmed' 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' 
                          : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800'
                      }`}>
                        {t(app.status)}
                      </span>

                      <div className="flex items-center gap-2">
                        {app.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'confirmed')}
                            className="p-2.5 bg-green-600 text-white hover:bg-green-700 rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-90"
                            title={t('confirm_appointment')}
                          >
                            <CheckCircle size={20} />
                          </button>
                        )}
                        {app.status === 'confirmed' && (
                          <button 
                            onClick={() => navigate(`/consultation/${app.id}`)}
                            className="p-2.5 bg-primary-600 text-white hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-600/20 transition-all active:scale-90"
                            title={t('join_consultation')}
                          >
                            <Video size={20} />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteAppointment(app.id)}
                          className="p-2.5 text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                          title={t('delete')}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Dernières Activités */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white px-2">{t('recent_activities')}</h3>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm space-y-8">
            {appointments.filter(a => a.status === 'completed').length > 0 ? (
              appointments.filter(a => a.status === 'completed').slice(0, 4).map((app, i) => (
                <div key={app.id} className="flex gap-4 relative">
                  {i !== appointments.filter(a => a.status === 'completed').slice(0, 4).length - 1 && (
                    <div className="w-0.5 h-full bg-gray-50 dark:bg-slate-800 absolute left-[15px] top-6"></div>
                  )}
                  <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center relative z-10 shrink-0 border border-primary-100 dark:border-primary-800">
                    <div className="w-2.5 h-2.5 bg-primary-600 dark:bg-primary-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white font-bold leading-snug">
                      {t('consultation_completed_with')} <span className="text-primary-600 dark:text-primary-400">{app.patient.user.first_name}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                      {new Date(app.appointment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="mx-auto text-gray-200 dark:text-slate-800 mb-4" size={32} />
                <p className="text-gray-400 dark:text-slate-500 text-sm italic">{t('no_recent_activity')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
