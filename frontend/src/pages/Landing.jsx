import React, { useEffect } from 'react';
import { 
  Activity, Shield, Video, Calendar, Users, 
  ArrowRight, CheckCircle, PhoneCall, Clock, Lock, Star, Sparkles, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/PublicLayout';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    whileHover={{ y: -10 }}
    className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-2xl hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-500 group"
  >
    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mb-8 text-primary-600 dark:text-primary-400 group-hover:scale-110 group-hover:rotate-6 transition-transform">
      <Icon size={32} />
    </div>
    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{title}</h3>
    <p className="text-gray-500 dark:text-slate-400 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (user.role === 'patient') {
        navigate('/patient/search');
      }
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <PublicLayout>
      <div className="bg-white dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-500">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="flex-1 text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm font-black mb-10 border border-primary-100 dark:border-primary-800 shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                  </span>
                  {t('available_247')}
                </div>
                <h1 className="text-5xl lg:text-[5.5rem] font-black text-gray-900 dark:text-white leading-[0.95] mb-10 tracking-tight">
                  {t('welcome')}
                </h1>
                <p className="text-xl text-gray-500 dark:text-slate-400 mb-12 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-medium">
                  {t('hero_sub') || 'Votre santé mérite le meilleur de la technologie. Consultez des spécialistes en quelques clics.'}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                  <Link to="/register" className="w-full sm:w-auto bg-slate-900 dark:bg-primary-600 text-white px-12 py-5 rounded-[2rem] text-lg font-black hover:bg-primary-600 dark:hover:bg-primary-700 shadow-2xl shadow-primary-600/30 transition-all flex items-center justify-center gap-3 group active:scale-95">
                    {t('take_appointment')}
                    <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link to="/doctor-directory" className="w-full sm:w-auto bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-800 px-12 py-5 rounded-[2rem] text-lg font-black hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95">
                    {t('see_specialists')}
                  </Link>
                </div>

                <div className="mt-16 flex items-center justify-center lg:justify-start gap-8 opacity-60">
                   <div className="flex -space-x-4">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                         <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                       </div>
                     ))}
                   </div>
                   <div className="text-sm font-bold text-gray-500 dark:text-slate-400">
                     <div className="flex items-center gap-1 text-yellow-500 mb-1">
                       {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                     </div>
                     {t('happy_patients')}
                   </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex-1 relative"
              >
                <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-white dark:border-slate-900 aspect-square">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" 
                    alt="Telemedicine Session" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 z-20 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
                    <Video size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('high_quality')}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{t('hd_video_call')}</p>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-10 -left-10 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 z-20 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('secure')}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{t('aes_encryption')}</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-primary-600 dark:bg-primary-700 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-[150px] translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="text-5xl lg:text-6xl font-black mb-3 leading-none">500+</p>
                <p className="text-primary-100 font-bold uppercase tracking-widest text-xs">{t('stats_doctors')}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}>
                <p className="text-5xl lg:text-6xl font-black mb-3 leading-none">24h</p>
                <p className="text-primary-100 font-bold uppercase tracking-widest text-xs">{t('stats_emergency')}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
                <p className="text-5xl lg:text-6xl font-black mb-3 leading-none">98%</p>
                <p className="text-primary-100 font-bold uppercase tracking-widest text-xs">{t('stats_satisfaction')}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }}>
                <p className="text-5xl lg:text-6xl font-black mb-3 leading-none">15min</p>
                <p className="text-primary-100 font-bold uppercase tracking-widest text-xs">{t('stats_waiting')}</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-40 bg-gray-50 dark:bg-slate-950 transition-colors">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-primary-600 dark:text-primary-400 font-black tracking-[0.2em] uppercase text-xs mb-6 flex items-center justify-center gap-3">
                <Sparkles size={16} />
                {t('why_choose_us')}
              </h2>
              <h3 className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tight leading-[0.95]">{t('complete_care_exp')}</h3>
              <p className="text-lg text-gray-500 dark:text-slate-400 font-medium">{t('complete_care_sub') || 'Nous réinventons l\'accès aux soins avec une plateforme sécurisée, intuitive et disponible partout au Maroc.'}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <FeatureCard 
                delay={0}
                icon={Video}
                title={t('feature_video_title')}
                description={t('feature_video_desc')}
              />
              <FeatureCard 
                delay={0.1}
                icon={Calendar}
                title={t('feature_calendar_title')}
                description={t('feature_calendar_desc')}
              />
              <FeatureCard 
                delay={0.2}
                icon={Lock}
                title={t('feature_security_title')}
                description={t('feature_security_desc')}
              />
            </div>

            <div className="mt-24 text-center">
               <button className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black hover:gap-4 transition-all">
                  {t('discover_features')}
                  <ChevronRight size={20} />
               </button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
           <div className="max-w-7xl mx-auto bg-slate-900 dark:bg-slate-900 rounded-[4rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h2 className="text-4xl lg:text-7xl font-black text-white mb-10 tracking-tight leading-[0.95]">
                  {t('ready_to_care_title')}
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link to="/register" className="w-full sm:w-auto bg-white text-slate-900 px-12 py-5 rounded-[2rem] text-lg font-black hover:bg-primary-50 transition-all active:scale-95 shadow-xl">
                    {t('register_free')}
                  </Link>
                  <Link to="/contact" className="w-full sm:w-auto border-2 border-white/20 text-white px-12 py-5 rounded-[2rem] text-lg font-black hover:bg-white/10 transition-all active:scale-95">
                    {t('contact_support')}
                  </Link>
                </div>
              </div>
           </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default Landing;
