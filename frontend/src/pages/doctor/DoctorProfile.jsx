import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Stethoscope, FileText, DollarSign, Award, UserCircle, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/doctor/profile');
        reset({
          specialty: res.data.specialty || '',
          bio: res.data.bio || '',
          license_number: res.data.license_number || '',
          experience_years: res.data.experience_years || '',
          price_per_consultation: res.data.price_per_consultation || 300
        });
        if (res.data.user?.avatar_url) {
          setAvatarPreview(`http://localhost:5001${res.data.user.avatar_url}`);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du profil:", err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [reset]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.put('/auth/avatar', formData);
      setAvatarPreview(`http://localhost:5001${res.data.avatar_url}`);
    } catch (err) {
      console.error("Erreur lors de l'upload de l'avatar:", err);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const errorEl = document.getElementById('error-message');
    if (errorEl) errorEl.innerText = '';
    
    try {
      await api.put('/doctor/profile', data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || t('load_error');
      if (errorEl) errorEl.innerText = msg;
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text={t('loading')} />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 p-8 md:p-12 transition-colors pb-20"
    >
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-12 border-b border-gray-50 dark:border-slate-800">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl group-hover:scale-105 transition-transform duration-500">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserCircle size={64} className="text-primary-600/30" />
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 bg-primary-600 p-3 rounded-2xl shadow-xl cursor-pointer hover:bg-primary-700 hover:scale-110 transition-all text-white border-2 border-white dark:border-slate-900">
            <Camera size={20} />
            <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
          </label>
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('profile_photo') || 'Photo de Profil'}</h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium max-w-xs">{t('avatar_specs') || 'Utilisez une photo professionnelle pour inspirer confiance à vos patients.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">
              <Stethoscope size={14} className="text-primary-600" />
              {t('specialty')}
            </label>
            <input
              {...register('specialty')}
              className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-bold"
              placeholder={t('specialty_placeholder_doc')}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">
              <Award size={14} className="text-primary-600" />
              {t('license_number')}
            </label>
            <input
              {...register('license_number')}
              className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-bold"
              placeholder={t('license_placeholder')}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">
              <FileText size={14} className="text-primary-600" />
              {t('experience_years')}
            </label>
            <input
              {...register('experience_years')}
              type="number"
              className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-bold"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">
              <DollarSign size={14} className="text-primary-600" />
              {t('price_per_consultation')} (MAD)
            </label>
            <input
              {...register('price_per_consultation')}
              type="number"
              className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-bold"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">
            {t('bio')}
          </label>
          <textarea
            {...register('bio')}
            rows={5}
            className="w-full px-6 py-5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-[2rem] focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none dark:text-white font-medium"
            placeholder={t('bio_placeholder')}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-50 dark:border-slate-800">
          <div className="w-full md:w-auto">
            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-100 dark:border-green-800"
                >
                  <CheckCircle size={18} />
                  <span className="text-sm font-bold">{t('profile_updated')}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div id="error-message" className="text-red-500 text-sm font-bold mt-2"></div>
          </div>
          
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-12 py-4.5 rounded-[1.5rem] font-black hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 group"
          >
            {saving ? <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
            {t('save_profile')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default DoctorProfile;
