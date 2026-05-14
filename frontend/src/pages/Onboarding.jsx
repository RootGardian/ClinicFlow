import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, FileText, DollarSign, Award, 
  Activity, Heart, User, MapPin, Phone, Calendar,
  UserRound, Users, Briefcase, ChevronRight, Sparkles, ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Onboarding = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      gender: user?.gender || ''
    }
  });

  const selectedGender = watch('gender');

  useEffect(() => {
    if (user?.is_profile_completed) {
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/search');
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.date_of_birth) {
        const birthDate = new Date(data.date_of_birth);
        const today = new Date();
        if (birthDate > today) {
          toast.error("La date de naissance ne peut pas être dans le futur.");
          setLoading(false);
          return;
        }
      }

      const endpoint = user.role === 'doctor' ? '/doctor/profile' : '/patient/medical-info';
      await api.put(endpoint, data);
      
      // Mettre à jour l'état local pour déclencher la redirection automatique via le useEffect
      setUser({ ...user, is_profile_completed: true });
    } catch (err) {
      console.error('FULL ERROR:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Erreur inconnue";
      toast.error(`Échec : ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const renderGenderSelector = () => (
    <div className="space-y-4">
      <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
        <Users size={14} className="text-primary-600" /> {t('gender') || 'Votre Genre'}
      </label>
      <div className="grid grid-cols-3 gap-4">
        {[
          { id: 'M', label: 'Homme', icon: UserRound },
          { id: 'F', label: 'Femme', icon: UserRound },
          { id: 'Autre', label: 'Autre', icon: Users },
        ].map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setValue('gender', g.id)}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all relative group ${
              selectedGender === g.id 
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-xl shadow-primary-600/10' 
              : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-600 hover:border-gray-200'
            }`}
          >
            <g.icon size={22} className={`${selectedGender === g.id ? 'scale-110' : ''} transition-transform`} />
            <span className="text-xs font-black uppercase tracking-tight">{g.label}</span>
          </button>
        ))}
      </div>
      <input type="hidden" {...register('gender', { required: true })} />
    </div>
  );

  const renderDoctorForm = () => (
    <div className="space-y-8">
      {renderGenderSelector()}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <Stethoscope size={14} className="text-primary-600" /> {t('specialty')}
          </label>
          <input {...register('specialty', { required: true })} className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold" placeholder="Ex: Cardiologue" />
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <Award size={14} className="text-primary-600" /> N° de Licence (RPPS)
          </label>
          <input {...register('license_number', { required: true })} className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold" placeholder="123456789" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <Briefcase size={14} className="text-primary-600" /> Expérience (Années)
          </label>
          <input type="number" {...register('experience_years', { required: true })} className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold" />
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <DollarSign size={14} className="text-primary-600" /> Tarif Consultation (MAD)
          </label>
          <input type="number" {...register('price_per_consultation', { required: true })} className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold" />
        </div>
      </div>
      <div className="space-y-3">
        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">Courte Biographie</label>
        <textarea {...register('bio', { required: true })} rows={4} className="w-full px-6 py-5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-[2rem] outline-none resize-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-medium" placeholder="Décrivez votre parcours..." />
      </div>
    </div>
  );

  const renderPatientForm = () => (
    <div className="space-y-8">
      {renderGenderSelector()}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">Groupe Sanguin</label>
          <select {...register('blood_group', { required: true })} className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold appearance-none">
            <option value="">--</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">Poids (kg)</label>
          <input 
            type="number" 
            {...register('weight', { required: true, min: 2, max: 500 })} 
            className={`w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border ${errors.weight ? 'border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold`} 
          />
          {errors.weight && <p className="text-[10px] text-red-500 font-bold px-1">Poids invalide (2-500kg)</p>}
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">Taille (cm)</label>
          <input 
            type="number" 
            {...register('height', { required: true, min: 30, max: 250 })} 
            className={`w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border ${errors.height ? 'border-red-500' : 'border-gray-100 dark:border-slate-700'} rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold`} 
          />
          {errors.height && <p className="text-[10px] text-red-500 font-bold px-1">Taille invalide (30-250cm)</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <Phone size={14} className="text-primary-600" /> {t('phone_label') || 'Téléphone'}
          </label>
          <input {...register('phone', { required: true })} className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold" placeholder="+212 ..." />
        </div>
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <Calendar size={14} className="text-primary-600" /> {t('born_on') || 'Date de naissance'}
          </label>
          <input type="date" {...register('date_of_birth', { required: true })} className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold" />
        </div>
      </div>
      <div className="space-y-3">
        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
          <MapPin size={14} className="text-primary-600" /> {t('address_label') || 'Adresse'}
        </label>
        <input {...register('address')} className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold" placeholder="Casablanca, Maarif..." />
      </div>
      <div className="space-y-3">
        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
          <Heart size={14} className="text-red-500" /> {t('allergies_title') || 'Allergies'}
        </label>
        <input {...register('allergies')} className="w-full px-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white font-bold" placeholder="Pénicilline, Pollen... (ou Aucun)" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px] border border-gray-100 dark:border-slate-800 relative z-10"
      >
        <div className="bg-slate-900 dark:bg-slate-800 md:w-1/3 p-12 text-white flex flex-col justify-between relative overflow-hidden border-r border-white/5">
          <div className="relative z-10">
            <div className="bg-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-primary-600/20">
              <Sparkles size={32} />
            </div>
            <h1 className="text-4xl font-black mb-6 leading-tight tracking-tight">{t('finalize_profile_title') || 'Finalisons votre profil'}</h1>
            <p className="text-slate-400 text-base leading-relaxed font-medium">
              {t('finalize_profile_sub') || 'Bienvenue sur ClinicFlow. Quelques informations pour personnaliser votre expérience santé et vous offrir le meilleur suivi.'}
            </p>
          </div>
          
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                <div className="w-8 h-1 bg-primary-600 rounded-full"></div>
                <span>Étape Finale</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-500" />
                Données Sécurisées & Chiffrées
             </div>
          </div>

          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-500/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="flex-1 p-10 md:p-20 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              {user?.role === 'doctor' ? t('professional_profile') : t('my_medical_record')}
            </h2>
            <div className="h-1.5 w-20 bg-primary-600 rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            {user?.role === 'doctor' ? renderDoctorForm() : renderPatientForm()}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-[2rem] font-black hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>{t('finish_registration') || 'Terminer mon inscription'} <ChevronRight size={22} className="group-hover:translate-x-2 transition-transform" /></>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
