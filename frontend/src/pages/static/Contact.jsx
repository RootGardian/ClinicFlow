import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="py-20 px-10 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          {/* Left Side: Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black text-gray-900 mb-8 leading-tight">
              {t('contact_title_1')} <span className="text-primary-600">{t('contact_title_2')}</span>
            </h1>
            <p className="text-xl text-gray-500 mb-12">
              {t('contact_sub')}
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('phone_label') || 'Téléphone'}</p>
                  <p className="text-lg font-bold text-gray-900">+212 522 00 00 00</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('email_label') || 'Email'}</p>
                  <p className="text-lg font-bold text-gray-900">contact@clinicflow.ma</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('office_label')}</p>
                  <p className="text-lg font-bold text-gray-900">{t('office_address')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-primary-600/10 border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">{t('send_us_message')}</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('last_name_label')}</label>
                  <input className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder={t('contact_placeholder_name')} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t('first_name_label')}</label>
                  <input className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder={t('contact_placeholder_first')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('email_label')}</label>
                <input className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder={t('contact_placeholder_email')} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t('message_label')}</label>
                <textarea rows={5} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none" placeholder={t('contact_placeholder_msg')} />
              </div>
              <button className="w-full bg-primary-600 text-white py-5 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-3">
                {t('send_message_btn')} <Send size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
};


export default Contact;
