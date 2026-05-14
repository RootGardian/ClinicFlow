import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, Trash2, AlertCircle, Download, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://clinicflow-backend-wi33.onrender.com';
  return url.replace('/api', '');
};
const socket = io(getSocketUrl());

const PatientAppointments = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/patient/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des rendez-vous:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();

    socket.on('prescription_generated', (data) => {
      fetchAppointments();
    });

    socket.on('appointment_updated', (data) => {
      fetchAppointments();
      toast.success(`Votre rendez-vous a été mis à jour : ${data.status}`);
    });

    return () => {
      socket.off('prescription_generated');
      socket.off('appointment_updated');
    };
  }, []);

  const handleDownloadPrescription = async (app) => {
    if (!app.prescription) {
       toast.error(t('no_prescription_yet'));
       return;
    }
    try {
      const response = await api.get(`/prescription/${app.prescription.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ordonnance-${app.prescription.reference_num}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error(t('error_download'));
    }
  };

  const cancelAppointment = async (id) => {
    toast((tId) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-gray-900">{t('confirm_cancel_appt')}</span>
        <div className="flex gap-2">
          <button 
            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
            onClick={async () => {
              toast.dismiss(tId.id);
              try {
                await api.delete(`/patient/appointments/${id}`);
                setAppointments(prev => prev.filter(a => a.id !== id));
                toast.success('Rendez-vous annulé');
              } catch (err) {
                console.error("Erreur lors de l'annulation:", err);
                toast.error("Erreur lors de l'annulation");
              }
            }}
          >
            Confirmer
          </button>
          <button 
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm"
            onClick={() => toast.dismiss(tId.id)}
          >
            Annuler
          </button>
        </div>
      </div>
    ));
  };

  if (loading) return <LoadingSpinner text={t('loading')} />;

  return (
    <div className="space-y-8 pb-10">

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {appointments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 p-16 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-800 text-center"
            >
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200 dark:text-slate-700">
                <Calendar size={40} />
              </div>
              <p className="text-gray-400 dark:text-slate-500 font-bold">{t('no_appts_msg')}</p>
              <button 
                onClick={() => navigate('/patient/search')}
                className="mt-6 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
              >
                {t('book_first_appt') || 'Prendre rendez-vous'}
              </button>
            </motion.div>
          ) : (
            appointments.map((app, i) => (
              <motion.div 
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary-600/20 group-hover:scale-105 transition-transform">
                    {app.doctor.user.first_name[0]}{app.doctor.user.last_name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">Dr. {app.doctor.user.first_name} {app.doctor.user.last_name}</h4>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-bold mt-1">{app.doctor.specialty || t('general_practitioner')}</p>
                    <div className="flex items-center gap-4 mt-3 text-gray-500 dark:text-slate-400 text-xs font-medium">
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                        <Calendar size={14} className="text-primary-600" />
                        {new Date(app.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                        <Clock size={14} className="text-primary-600" />
                        {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    app.status === 'pending' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800' :
                    app.status === 'confirmed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' :
                    app.status === 'completed' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800' :
                    'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-700'
                  }`}>
                    {t(app.status)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {app.status === 'confirmed' && (
                      <button 
                        onClick={() => navigate(`/consultation/${app.id}`)}
                        className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95"
                      >
                        <Video size={18} />
                        {t('join')}
                      </button>
                    )}

                    {app.status === 'completed' && app.prescription && (
                      <button 
                        onClick={() => handleDownloadPrescription(app)}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                      >
                        <Download size={18} />
                        {t('download_prescription')}
                      </button>
                    )}
                    
                    {app.status !== 'completed' && (
                      <button 
                        onClick={() => cancelAppointment(app.id)}
                        className="p-3 text-gray-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title={t('cancel_appt')}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 flex gap-4 items-start shadow-sm shadow-blue-600/5">
        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <AlertCircle className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
          <strong className="dark:text-white block mb-1">{t('consultation_note')}</strong> {t('consultation_note_msg') || 'Veuillez vous connecter 5 minutes avant le début de votre téléconsultation.'}
        </p>
      </div>
    </div>
  );
};

export default PatientAppointments;
