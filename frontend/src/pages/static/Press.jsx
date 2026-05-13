import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Mail, ExternalLink } from 'lucide-react';

const Press = () => {
  const { t } = useTranslation();

  const releases = [
    {
      id: 1,
      date: "15 Avril 2026",
      title: "ClinicFlow lève 5 millions de MAD pour accélérer son expansion au Maroc.",
      category: "Communiqué de presse"
    },
    {
      id: 2,
      date: "20 Mars 2026",
      title: "Partenariat stratégique entre ClinicFlow et les principales mutuelles nationales.",
      category: "Actualité"
    }
  ];

  return (
    <PublicLayout>
      <div className="py-20 px-10 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h1 className="text-5xl font-black text-gray-900 mb-6">{t('press_title')}</h1>
          <p className="text-xl text-gray-500">{t('press_sub')}</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 mb-32">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <FileText className="text-primary-600" /> Derniers Communiqués
            </h2>
            <div className="space-y-6">
              {releases.map((rel, i) => (
                <motion.div 
                  key={rel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{rel.date}</span>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors flex justify-between items-start gap-4">
                    {rel.title}
                    <ExternalLink size={20} className="shrink-0 text-gray-300" />
                  </h3>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-10 bg-gray-900 text-white rounded-[3rem] shadow-2xl">
               <h3 className="text-xl font-bold mb-6">Kit Média</h3>
               <p className="text-gray-400 text-sm mb-8 leading-relaxed">Téléchargez notre logo, nos captures d'écran et nos photos officielles.</p>
               <button className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
                 <Download size={20} /> Télécharger (.zip)
               </button>
            </div>

            <div className="p-10 bg-primary-50 rounded-[3rem] border border-primary-100">
               <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Presse</h3>
               <p className="text-gray-600 text-sm mb-8 leading-relaxed">Pour toute demande d'interview ou d'information complémentaire.</p>
               <a href="mailto:press@clinicflow.ma" className="flex items-center gap-3 text-primary-600 font-bold hover:underline">
                 <Mail size={20} /> press@clinicflow.ma
               </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Press;
