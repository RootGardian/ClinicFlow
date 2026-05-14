import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, Calendar, Save, AlertCircle, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorAgenda = () => {
  const { t } = useTranslation();
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get translated days from i18n
  const DAYS = t('days', { returnObjects: true }) || [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const res = await api.get('/doctor/profile');
        setAvailabilities(res.data.availabilities || []);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'agenda:", err);
      }
      setLoading(false);
    };
    fetchAvailabilities();
  }, []);

  const addSlot = () => {
    setAvailabilities([...availabilities, { day_of_week: 1, start_time: '09:00', end_time: '12:00' }]);
  };

  const removeSlot = (index) => {
    setAvailabilities(availabilities.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const newAvail = [...availabilities];
    newAvail[index][field] = field === 'day_of_week' ? parseInt(value) : value;
    setAvailabilities(newAvail);
  };

  const saveAvailabilities = async () => {
    setSaving(true);
    try {
      await api.post('/doctor/availabilities', { availabilities });
      toast.success(t('save_success_alert') || 'Agenda mis à jour avec succès !');
    } catch (err) {
      console.error(err);
      toast.error(t('save_error_alert') || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text={t('loading')} />;

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{t('define_slots_title')}</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">{t('define_slots_sub') || 'Configurez vos horaires de disponibilité pour les téléconsultations.'}</p>
          </div>
          <button 
            onClick={addSlot}
            className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            {t('add_slot_btn')}
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {availabilities.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[2rem] text-gray-400 dark:text-slate-600 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center">
                  <Calendar size={32} />
                </div>
                <p className="font-bold">{t('no_slots_defined')}</p>
              </motion.div>
            ) : (
              availabilities.map((slot, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col lg:flex-row items-center gap-4 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
                >
                  <div className="flex-1 w-full lg:max-w-xs">
                    <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block px-1">{t('day') || 'Jour'}</label>
                    <div className="relative">
                      <select 
                        value={slot.day_of_week}
                        onChange={(e) => updateSlot(index, 'day_of_week', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 px-5 py-3.5 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-bold appearance-none shadow-sm"
                      >
                        {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
                      </select>
                      <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block px-1">{t('from_time') || 'De'}</label>
                      <div className="relative">
                        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" />
                        <input 
                          type="time" 
                          value={slot.start_time}
                          onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-bold shadow-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 block px-1">{t('to_time')}</label>
                      <div className="relative">
                        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" />
                        <input 
                          type="time" 
                          value={slot.end_time}
                          onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-bold shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeSlot(index)}
                    className="mt-6 lg:mt-0 p-4 text-gray-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                    title={t('delete')}
                  >
                    <Trash2 size={22} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 pt-10 border-t border-gray-50 dark:border-slate-800 flex flex-col items-center gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-4 items-center w-full">
            <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0" size={20} />
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
              {t('agenda_hint') || "Les créneaux que vous définissez ici seront visibles par tous les patients lors de la recherche."}
            </p>
          </div>
          
          <button 
            onClick={saveAvailabilities}
            disabled={saving}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4.5 rounded-[1.5rem] font-black hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
          >
            {saving ? <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
            {t('save_agenda_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorAgenda;
