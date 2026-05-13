import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Pricing = () => {
  const { t } = useTranslation();
  
  const plans = [
    {
      title: t('plan_patient_title'),
      price: t('plan_patient_price'),
      desc: t('plan_patient_desc'),
      features: [
        t('pricing_feature_1'),
        t('pricing_feature_2'),
        t('pricing_feature_3'),
        t('pricing_feature_4'),
      ],
      cta: t('register'),
      highlight: false
    },
    {
      title: t('plan_doctor_title'),
      price: t('plan_doctor_price'),
      period: t('plan_doctor_period'),
      desc: t('plan_doctor_desc'),
      features: [
        t('pricing_feature_1'),
        t('pricing_feature_5'),
        t('pricing_feature_6'),
        t('pricing_feature_3'),
        t('pricing_feature_2'),
        t('pricing_feature_4'),
      ],
      cta: t('about_join_btn'),
      highlight: true
    }
  ];

  return (
    <PublicLayout>
      <div className="py-20 px-10 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl font-black text-gray-900 mb-6">{t('pricing_title')}</h1>
          <p className="text-xl text-gray-500">{t('pricing_sub')}</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {plans.map((p, i) => (
            <div 
              key={i}
              className={`p-12 rounded-[3rem] transition-all flex flex-col justify-between ${
                p.highlight 
                ? 'bg-gray-900 text-white shadow-2xl shadow-primary-600/20 scale-105 border-4 border-primary-600 relative z-10' 
                : 'bg-white text-gray-900 border border-gray-100'
              }`}
            >
              <div>
                <h3 className="text-2xl font-bold mb-4">{p.title}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black">{p.price}</span>
                  {p.period && <span className={p.highlight ? 'text-gray-400' : 'text-gray-500'}>{p.period}</span>}
                </div>
                <p className={`mb-10 text-sm ${p.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{p.desc}</p>
                
                <ul className="space-y-4 mb-12">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <Check size={20} className="text-primary-500" />
                      <span className="text-sm font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`w-full py-5 rounded-2xl font-bold transition-all ${
                p.highlight 
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-600/30' 
                : 'bg-gray-900 text-white hover:bg-black'
              }`}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default Pricing;
