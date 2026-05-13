import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { Shield, Scale, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Legal = () => {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="py-20 px-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-4">{t('legal_title')}</h1>
          <p className="text-gray-500">{t('legal_sub')}</p>
        </div>

        <div className="space-y-12">
          <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FileText className="text-primary-600" /> {t('legal_section_1_title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal_section_1_desc')}
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Shield className="text-primary-600" /> {t('legal_section_2_title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal_section_2_desc')}
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Scale className="text-primary-600" /> {t('legal_section_3_title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal_section_3_desc')}
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Legal;
