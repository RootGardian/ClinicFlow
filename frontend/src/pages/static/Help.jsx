import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { Book, MessageSquare, ShieldCheck, LifeBuoy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Help = () => {
  const { t } = useTranslation();
  const faqs = t('faqs', { returnObjects: true }) || [];

  return (
    <PublicLayout>
      <div className="py-20 px-10 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
             <LifeBuoy className="text-primary-600" size={32} /> {t('help_center_title')}
          </h1>
          <p className="text-gray-500 text-lg">{t('help_center_sub')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 bg-gray-50 rounded-3xl text-center hover:bg-white hover:shadow-xl transition-all border border-gray-100">
             <Book size={32} className="mx-auto text-primary-600 mb-4" />
             <h3 className="font-bold mb-2">{t('guides_title')}</h3>
             <p className="text-sm text-gray-500">{t('guides_sub')}</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-3xl text-center hover:bg-white hover:shadow-xl transition-all border border-gray-100">
             <MessageSquare size={32} className="mx-auto text-green-600 mb-4" />
             <h3 className="font-bold mb-2">{t('live_chat_title')}</h3>
             <p className="text-sm text-gray-500">{t('live_chat_sub')}</p>
          </div>
          <div className="p-8 bg-gray-50 rounded-3xl text-center hover:bg-white hover:shadow-xl transition-all border border-gray-100">
             <ShieldCheck size={32} className="mx-auto text-orange-600 mb-4" />
             <h3 className="font-bold mb-2">{t('privacy_title')}</h3>
             <p className="text-sm text-gray-500">{t('privacy_sub')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-8">{t('faq_title')}</h2>
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl">
               <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
               <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Help;
