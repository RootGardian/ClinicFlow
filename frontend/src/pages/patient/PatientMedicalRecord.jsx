import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplet, 
  Weight, 
  Ruler, 
  AlertCircle, 
  Save, 
  Phone, 
  MapPin,
  Activity
} from 'lucide-react';
import api from '../../utils/api';

const PatientMedicalRecord = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchMedicalInfo = async () => {
      try {
        const res = await api.get('/patient/medical-info');
        reset(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des infos médicales:", err);
      }
      setLoading(false);
    };
    fetchMedicalInfo();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      await api.put('/patient/medical-info', data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur lors de la mise à jour des infos médicales:", err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-gray-400 font-medium animate-pulse">{t('loading')}</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 p-8 md:p-10 transition-colors"
    >

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Groupe Sanguin */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
              <Droplet size={18} className="text-red-500" />
              {t('blood_group')}
            </label>
            <select
              {...register('blood_group')}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white"
            >
              <option value="">{t('select_placeholder')}</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                <option key={g} value={g} className="dark:bg-slate-900">{g}</option>
              ))}
            </select>
          </div>

          {/* Poids */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
              <Weight size={18} className="text-blue-500" />
              {t('weight')} (kg)
            </label>
            <input
              {...register('weight')}
              type="number"
              step="0.1"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white"
              placeholder="Ex: 70.5"
            />
          </div>

          {/* Taille */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
              <Ruler size={18} className="text-green-500" />
              {t('height')} (cm)
            </label>
            <input
              {...register('height')}
              type="number"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white"
              placeholder="Ex: 175"
            />
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
            <AlertCircle size={18} className="text-orange-500" />
            {t('allergies_title')}
          </label>
          <textarea
            {...register('allergies')}
            rows={3}
            className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none text-gray-900 dark:text-white"
            placeholder={t('allergies_placeholder')}
          />
        </div>

        {/* Contact info */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
              <Phone size={18} className="text-gray-400" />
              {t('phone_label') || 'Téléphone'}
            </label>
            <input
              {...register('phone')}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">
              <MapPin size={18} className="text-gray-400" />
              {t('address_label') || 'Adresse'}
            </label>
            <input
              {...register('address')}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-100 dark:border-slate-800 gap-4">
          <div className="h-6">
            <AnimatePresence>
              {success && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-green-600 dark:text-green-400 font-bold flex items-center gap-2 text-sm"
                >
                  <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">✓</span>
                  {t('record_updated_success')}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-primary-600/20 transition-all flex items-center justify-center gap-3"
          >
            <Save size={20} />
            {t('update_record_btn')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default PatientMedicalRecord;
