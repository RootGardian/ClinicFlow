import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownRight, History, ShieldCheck, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://clinicflow-backend-wi33.onrender.com';
  return url.replace('/api', '');
};
const socket = io(getSocketUrl());

const DoctorWallet = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/doctor/wallet');
      setData(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération du portefeuille:", err);
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if ((data?.totalEarnings || 0) <= 0) {
      return toast.error("Votre solde est insuffisant.");
    }

    try {
      await api.post('/doctor/withdraw');
      toast.success("Demande de retrait envoyée ! Elle sera traitée sous 24h.");
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du retrait.");
    }
  };

  useEffect(() => {
    fetchWallet();

    socket.on('prescription_generated', () => {
      fetchWallet();
    });

    return () => {
      socket.off('prescription_generated');
    };
  }, []);

  if (loading) return <LoadingSpinner text={t('loading')} />;

  return (
    <div className="space-y-8 pb-10">
      {/* Solde Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-primary-600 dark:to-primary-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
              <Wallet size={32} className="text-primary-300" />
            </div>
            <div className="flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10">
              <ShieldCheck size={14} className="text-green-400" />
              {t('verified_account') || 'Compte Vérifié'}
            </div>
          </div>
          <p className="text-slate-400 dark:text-primary-100 mb-2 font-bold uppercase tracking-widest text-xs">{t('available_balance')}</p>
          <div className="flex items-baseline gap-4 mb-12">
            <h2 className="text-6xl font-black tracking-tighter">{(data?.totalEarnings || 0).toLocaleString()}</h2>
            <span className="text-2xl font-bold text-slate-500 dark:text-primary-200 uppercase">{data?.currency || 'MAD'}</span>
          </div>
          <button 
            onClick={handleWithdraw}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-[1.5rem] font-black hover:bg-primary-600 dark:hover:bg-primary-50 transition-all flex items-center gap-3 shadow-2xl active:scale-95 group/btn"
          >
            <CreditCard size={22} className="group-hover/btn:rotate-12 transition-transform" />
            {t('withdraw_earnings') || 'Retirer mes revenus'}
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:border-green-200 dark:hover:border-green-900 transition-all"
        >
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('this_month')}</p>
            <p className="font-black text-2xl text-gray-900 dark:text-white">+{(data?.monthlyEarnings || 0).toLocaleString()} <span className="text-sm font-bold text-gray-400">{data?.currency}</span></p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:border-blue-200 dark:hover:border-blue-900 transition-all"
        >
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <History size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('total_consultations')}</p>
            <p className="font-black text-2xl text-gray-900 dark:text-white">{(data?.transactions?.length || 0)} <span className="text-sm font-bold text-gray-400">{t('total_suffix')}</span></p>
          </div>
        </motion.div>
      </div>

      {/* Transactions History */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-10 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-black text-xl text-gray-900 dark:text-white">{t('transaction_history')}</h3>
          <button className="text-sm font-black text-primary-600 dark:text-primary-400 hover:underline">{t('view_all')}</button>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-800">
          <AnimatePresence mode="popLayout">
            {!data?.transactions || data.transactions.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-300 dark:text-slate-700">
                  <History size={32} />
                </div>
                <p className="text-gray-400 dark:text-slate-500 font-bold">{t('no_transactions_msg')}</p>
              </div>
            ) : (
              data.transactions.map((t_item, i) => (
                <motion.div 
                  key={t_item.id || i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-8 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                      <ArrowUpRight size={20} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">{t('consultation_num')}{t_item.appointment_id}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500 font-bold mt-1 uppercase tracking-widest">{new Date(t_item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-green-600 dark:text-green-400">+{t_item.amount} <span className="text-xs font-bold opacity-70">{t_item.currency}</span></p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest">{t_item.status}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DoctorWallet;
