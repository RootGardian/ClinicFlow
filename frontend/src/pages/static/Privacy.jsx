import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { Eye, ShieldCheck, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="py-20 px-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-4">{t('privacy_page_title')}</h1>
          <p className="text-gray-500">{t('privacy_page_sub')}</p>
        </div>

        <div className="space-y-12">
          <section className="p-8 rounded-3xl bg-blue-50 border border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Eye className="text-blue-600" /> {t('privacy_section_1_title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('privacy_section_1_desc')}
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-green-50 border border-green-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <ShieldCheck className="text-green-600" /> {t('privacy_section_2_title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('privacy_section_2_desc')}
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-orange-50 border border-orange-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <UserCheck className="text-orange-600" /> {t('privacy_section_3_title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('privacy_section_3_desc')}
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Privacy;
