import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Activity, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import { QRCodeSVG } from 'qrcode.react';

const Login = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaSetupRequired, setMfaSetupRequired] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState(null);
  const [mfaUserId, setMfaUserId] = useState(null);
  const [mfaToken, setMfaToken] = useState('');
  const { login, verifyMfa } = useAuth();
  const navigate = useNavigate();

  const loginSchema = z.object({
    email: z.string().email(t('email_error') || 'Email invalide'),
    password: z.string().min(6, t('password_error') || 'Mot de passe trop court'),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setError('');
    try {
      const response = await login(data.email, data.password);
      
      if (response.mfa_setup_required) {
        setMfaSetupRequired(true);
        setMfaUserId(response.userId);
        // Fetch setup data (QR Code)
        const setupRes = await api.post('/auth/mfa/init-mandatory', { userId: response.userId });
        setMfaSetupData(setupRes.data);
        return;
      }

      if (response.mfa_required) {
        setMfaRequired(true);
        setMfaUserId(response.userId);
        return;
      }

      const { role, is_profile_completed } = response.user;
      
      if (!is_profile_completed) {
        navigate('/onboarding');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/search');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || t('login_error_generic') || 'Identifiants incorrects');
    }
  };

  const onMfaSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await verifyMfa(mfaUserId, mfaToken, mfaSetupData?.secret);
      const { role, is_profile_completed } = response.user;
      if (!is_profile_completed) {
        navigate('/onboarding');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/search');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Code MFA invalide');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-6 transition-colors duration-500 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 md:p-12 border border-gray-100 dark:border-slate-800 relative z-10"
      >
        <div className="mb-12 flex justify-between items-center">
          <Link to="/" className="text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <ArrowLeft size={16} /> {t('back')}
          </Link>
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-600/20">
              <Activity className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">ClinicFlow</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">{t('welcome_back')}</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-3 font-medium">{t('login_sub') || 'Connectez-vous pour accéder à votre espace santé.'}</p>
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


        {!mfaRequired && !mfaSetupRequired ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1">{t('email_label')}</label>
              <div className="relative group">
                <Mail className="absolute start-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-primary-600 transition-colors" size={20} />
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
              <div className="relative group">
                <Lock className="absolute start-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-primary-600 transition-colors" size={20} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full ps-14 pe-14 py-4.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-bold"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-gray-200 text-primary-600 focus:ring-primary-500 dark:bg-slate-800 dark:border-slate-700 transition-all" />
                </div>
                <span className="text-sm text-gray-500 dark:text-slate-400 font-bold group-hover:text-primary-600 transition-colors">{t('remember_me')}</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-black text-primary-600 hover:text-primary-700 transition-colors underline-offset-4 hover:underline">{t('forgot_password')}</Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 dark:bg-primary-600 text-white py-5 rounded-[1.5rem] font-black hover:bg-primary-600 dark:hover:bg-primary-700 shadow-2xl shadow-primary-600/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 active:scale-95"
            >
              {isSubmitting ? <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : (
                <>{t('login_btn')} <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" /></>
              )}
            </button>
          </form>
        ) : mfaRequired ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Vérification MFA</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium">Entrez le code de votre application d'authentification.</p>
            </div>

            <form onSubmit={onMfaSubmit} className="space-y-6">
              <input
                type="text"
                maxLength="6"
                autoFocus
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-6 py-5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-black text-center tracking-[0.5em] text-2xl"
              />
              <button
                type="submit"
                disabled={mfaToken.length !== 6 || isSubmitting}
                className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                Vérifier et se connecter
              </button>
              <button
                type="button"
                onClick={() => setMfaRequired(false)}
                className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Retour
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Sécurité Obligatoire</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium">Le MFA est maintenant requis pour tous les comptes. Veuillez scanner ce code.</p>
            </div>

            {mfaSetupData && (
              <div className="flex flex-col items-center gap-4 bg-gray-50 dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700">
                <div className="bg-white p-3 rounded-xl shadow-lg">
                  <QRCodeSVG value={mfaSetupData.otpauth} size={150} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1">Code de secours</p>
                  <p className="text-sm font-mono text-primary-600 dark:text-primary-400 font-bold">{mfaSetupData.secret}</p>
                </div>
              </div>
            )}

            <form onSubmit={onMfaSubmit} className="space-y-6">
              <input
                type="text"
                maxLength="6"
                autoFocus
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                placeholder="Entrez le code généré"
                className="w-full px-6 py-5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-black text-center tracking-[0.2em] text-xl"
              />
              <button
                type="submit"
                disabled={mfaToken.length !== 6 || isSubmitting}
                className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                Activer et continuer
              </button>
            </form>
          </motion.div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-50 dark:border-slate-800 text-center">
           <p className="text-gray-500 dark:text-slate-400 font-medium">
             {t('no_account') || "Pas encore de compte ?"}{' '}
             <Link to="/register" className="font-black text-primary-600 hover:text-primary-700 transition-colors">{t('create_account')}</Link>
           </p>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 text-[10px] font-black text-gray-300 dark:text-slate-700 uppercase tracking-[0.2em]">
           <ShieldCheck size={12} />
           AES-256 Encrypted Connection
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
