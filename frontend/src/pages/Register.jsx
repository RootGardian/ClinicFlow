import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Activity, ArrowRight, Stethoscope, UserRound, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const { register: signup, login: loginUser } = useAuth();
  const navigate = useNavigate();

  const registerSchema = z.object({
    first_name: z.string().min(2, t('first_name_error') || 'Prénom trop court'),
    last_name: z.string().min(2, t('last_name_error') || 'Nom trop court'),
    email: z.string().email(t('email_error') || 'Email invalide'),
    password: z.string().min(6, t('password_error') || 'Mot de passe trop court'),
    role: z.enum(['patient', 'doctor']),
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'patient' }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setError('');
    try {
      await signup(data);
      // Auto-login après inscription
      const response = await loginUser(data.email, data.password);
      const { role, is_profile_completed } = response.user;

      if (!is_profile_completed) {
        navigate('/onboarding');
      } else if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/search');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || t('register_error_generic') || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-6 py-12 transition-colors duration-500 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-gray-100 dark:border-slate-800 relative z-10"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="bg-primary-600 p-2.5 rounded-xl shadow-lg shadow-primary-600/20 group-hover:rotate-12 transition-transform">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">ClinicFlow</span>
          </Link>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">{t('create_account_title')}</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-3 font-medium">{t('join_network') || 'Rejoignez le premier réseau de téléconsultation au Maroc.'}</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-8 p-5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold border border-red-100 dark:border-red-800 flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-5 mb-10">
            <button
              type="button"
              onClick={() => setValue('role', 'patient')}
              className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${
                selectedRole === 'patient' 
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-xl shadow-primary-600/10' 
                : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-600 hover:border-gray-200'
              }`}
            >
              <UserRound size={32} className={`${selectedRole === 'patient' ? 'scale-110' : ''} transition-transform duration-500`} />
              <span className="font-black text-xs uppercase tracking-widest">{t('patient')}</span>
              {selectedRole === 'patient' && <div className="absolute top-2 end-2 w-2 h-2 bg-primary-600 rounded-full"></div>}
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'doctor')}
              className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${
                selectedRole === 'doctor' 
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-xl shadow-primary-600/10' 
                : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-600 hover:border-gray-200'
              }`}
            >
              <Stethoscope size={32} className={`${selectedRole === 'doctor' ? 'scale-110' : ''} transition-transform duration-500`} />
              <span className="font-black text-xs uppercase tracking-widest">{t('doctor')}</span>
              {selectedRole === 'doctor' && <div className="absolute top-2 end-2 w-2 h-2 bg-primary-600 rounded-full"></div>}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">{t('first_name_label')}</label>
              <div className="relative">
                <User className="absolute start-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
                <input
                  {...register('first_name')}
                  className="w-full ps-14 pe-6 py-4.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-bold"
                  placeholder={t('placeholder_first_name')}
                />
              </div>
              {errors.first_name && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">{t('last_name_label')}</label>
              <div className="relative">
                <User className="absolute start-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
                <input
                  {...register('last_name')}
                  className="w-full ps-14 pe-6 py-4.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-bold"
                  placeholder={t('placeholder_last_name')}
                />
              </div>
              {errors.last_name && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">{t('email_label')}</label>
            <div className="relative">
              <Mail className="absolute start-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
              <input
                {...register('email')}
                type="email"
                className="w-full ps-14 pe-6 py-4.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-bold"
                placeholder="votre@email.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">{errors.email.message}</p>}
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">{t('password_label')}</label>
            <div className="relative">
              <Lock className="absolute start-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
              <input
                {...register('password')}
                type="password"
                className="w-full ps-14 pe-6 py-4.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-bold"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 dark:bg-primary-600 text-white py-5 rounded-[1.5rem] font-black hover:bg-primary-600 dark:hover:bg-primary-700 shadow-2xl shadow-primary-600/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 active:scale-95"
          >
            {isSubmitting ? <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : (
              <>{t('register_btn')} <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-50 dark:border-slate-800 text-center">
           <p className="text-gray-500 dark:text-slate-400 font-medium">
             {t('already_have_account') || "Vous avez déjà un compte ?"}{' '}
             <Link to="/login" className="font-black text-primary-600 hover:text-primary-700 transition-colors">{t('login_btn')}</Link>
           </p>
        </div>

        <div className="mt-10 flex justify-center items-center gap-2 text-[10px] font-black text-gray-300 dark:text-slate-700 uppercase tracking-[0.2em]">
           <ShieldCheck size={12} />
           AES-256 Encrypted Connection
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
