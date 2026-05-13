import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { ShieldCheck, Lock, Server, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Security = () => {
  const { t } = useTranslation();
  
  const features = [
    { 
      icon: ShieldCheck, 
      title: t('security_card_1_title'), 
      desc: t('security_card_1_desc'),
      color: "bg-blue-100 text-blue-600"
    },
    { 
      icon: Lock, 
      title: t('security_card_2_title'), 
      desc: t('security_card_2_desc'),
      color: "bg-green-100 text-green-600"
    },
    { 
      icon: Server, 
      title: t('security_card_3_title'), 
      desc: t('security_card_3_desc'),
      color: "bg-purple-100 text-purple-600"
    },
  ];

  return (
    <PublicLayout>
      <div className="py-24 px-10 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-xs font-bold mb-6 uppercase tracking-widest"
          >
            <ShieldCheck size={16} /> {t('security_badge')}
          </motion.div>
          <h1 className="text-5xl font-black text-gray-900 mb-8 leading-tight">
            {t('security_title')} <br/>
            <span className="text-primary-600">{t('security_title_2')}</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            {t('security_sub')}
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 mb-32">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-12 rounded-[3rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-2xl transition-all"
            >
              <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mb-8`}>
                <f.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Commitment Section */}
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-[4rem] p-16 text-white text-center relative overflow-hidden">
          <Activity size={300} className="absolute -top-20 -left-20 text-white/5" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-8">Un engagement total pour le Maroc.</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {['Loi 09-08', 'Audit Annuel', 'HTTPS Only', 'Sauvegardes'].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                   <p className="font-bold text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Security;
