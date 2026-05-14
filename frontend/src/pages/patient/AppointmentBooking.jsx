import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  CheckCircle2,
  AlertCircle,
  User
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const AppointmentBooking = () => {
  const { t } = useTranslation();
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Slot, 2: Confirm, 3: Success

  const DAYS = t('days', { returnObjects: true }) || ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctor/all`);
        const doc = res.data.find(d => d.id === parseInt(doctorId));
        setDoctor(doc);
      } catch (err) {
        console.error("Erreur lors de la récupération du docteur:", err);
      }
      setLoading(false);
    };
    fetchDoctor();
  }, [doctorId]);

  const handleBook = async () => {
    try {
      const [hours, minutes] = selectedSlot.split(':');
      const finalDate = new Date(selectedDate);
      finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const now = new Date();
      if (finalDate < now) {
        toast.error("Vous ne pouvez pas prendre de rendez-vous dans le passé.");
        return;
      }

      await api.post('/patient/appointments', {
        doctor_id: parseInt(doctorId),
        appointment_date: finalDate,
        type: 'video'
      });
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || t('load_error'));
    }
  };

  if (loading) return <LoadingSpinner text={t('loading')} />;

  if (!doctor) return (
    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <p className="text-gray-500 dark:text-slate-400 font-bold">{t('doctor_not_found') || 'Docteur non trouvé'}</p>
      <button onClick={() => navigate('/patient/search')} className="mt-6 text-primary-600 font-bold hover:underline">
        {t('back_to_search')}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all font-bold group"
      >
        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-800">
          <ChevronLeft size={20} />
        </div>
        {t('back_to_search')}
      </button>

      <AnimatePresence mode="wait">
        {step < 3 ? (
          <motion.div 
            key="booking-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-8 md:p-10 border-b border-gray-50 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6 bg-gray-50/50 dark:bg-slate-900/50">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary-600/20">
                {doctor.user.first_name[0]}{doctor.user.last_name[0]}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Dr. {doctor.user.first_name} {doctor.user.last_name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold border border-primary-100 dark:border-primary-800">
                    {doctor.specialty || t('general_practitioner')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              {step === 1 ? (
                <div className="space-y-10">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
                        <CalendarIcon size={18} />
                      </div>
                      {t('choose_day')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[0, 1, 2, 3].map(i => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedDate(date)}
                            className={`p-4 rounded-2xl border-2 transition-all text-center ${
                              isSelected 
                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600' 
                                : 'border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-primary-200 dark:hover:border-primary-800 text-gray-400'
                            }`}
                          >
                            <p className="text-[10px] font-bold uppercase tracking-widest">{DAYS[date.getDay()]}</p>
                            <p className={`text-xl font-black ${isSelected ? 'text-primary-600' : 'text-gray-900 dark:text-white'}`}>{date.getDate()}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
                          <Clock size={18} />
                        </div>
                        {t('available_slots')}
                      </h3>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(time => (
                          <button
                            key={time}
                            onClick={() => setSelectedSlot(time)}
                            className={`py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                              selectedSlot === time 
                                ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                                : 'border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-primary-200 dark:hover:border-primary-800 text-gray-600 dark:text-slate-400'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <button
                    disabled={!selectedDate || !selectedSlot}
                    onClick={() => setStep(2)}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-bold hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
                  >
                    {t('continue_to_confirm')}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-3xl space-y-6 border border-gray-100 dark:border-slate-800">
                    <div className="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
                        <CalendarIcon size={18} />
                        <span className="font-bold text-xs uppercase tracking-wider">{t('date')}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
                        <Clock size={18} />
                        <span className="font-bold text-xs uppercase tracking-wider">{t('time')}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
                        <Video size={18} />
                        <span className="font-bold text-xs uppercase tracking-wider">{t('type')}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{t('video_consultation_type')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl font-bold border-2 border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                      {t('modify')}
                    </button>
                    <button onClick={handleBook} className="flex-[2] bg-gradient-to-r from-primary-600 to-primary-700 text-white py-5 rounded-2xl font-bold hover:shadow-xl hover:shadow-primary-600/20 transition-all">
                      {t('confirm_appt_btn')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success-card"
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[3rem] text-center shadow-xl border border-gray-100 dark:border-slate-800"
          >
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">{t('appt_confirmed_title')}</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed">{t('appt_success_msg', { name: doctor.user.last_name })}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/patient/appointments')} 
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-bold hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all shadow-lg"
              >
                {t('view_my_appts')}
              </button>
              <button 
                onClick={() => navigate('/patient/search')} 
                className="text-gray-500 dark:text-slate-400 font-bold px-10 py-4 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t('back_to_home')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentBooking;
