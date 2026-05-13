import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';

const Careers = () => {
  const { t } = useTranslation();

  const jobs = [
    {
      id: 1,
      title: "Développeur Fullstack React/Node",
      type: "CDI",
      location: "Casablanca / Remote",
      department: "Engineering"
    },
    {
      id: 2,
      title: "Product Designer UI/UX",
      type: "CDI",
      location: "Casablanca",
      department: "Design"
    },
    {
      id: 3,
      title: "Customer Success Manager",
      type: "CDI",
      location: "Casablanca",
      department: "Support"
    }
  ];

  return (
    <PublicLayout>
      <div className="py-20 px-10 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h1 className="text-5xl font-black text-gray-900 mb-6">{t('careers_title')}</h1>
          <p className="text-xl text-gray-500">{t('careers_sub')}</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <Briefcase className="text-primary-600" /> {t('careers_open_positions')}
          </h2>

          <div className="space-y-6">
            {jobs.map((job, i) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="text-center md:text-left">
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full mb-3 inline-block">
                    {job.department}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2"><MapPin size={16} /> {job.location}</span>
                    <span className="flex items-center gap-2"><Clock size={16} /> {job.type}</span>
                  </div>
                </div>

                <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-600 transition-all flex items-center gap-2">
                  Postuler <ArrowRight size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-32 max-w-4xl mx-auto bg-primary-600 rounded-[3rem] p-16 text-white text-center shadow-2xl shadow-primary-600/30">
           <h3 className="text-3xl font-bold mb-6">Candidature Spontanée ?</h3>
           <p className="text-primary-100 mb-10 text-lg">Vous ne trouvez pas le poste qui vous correspond ? Envoyez-nous votre CV à careers@clinicflow.ma</p>
           <button className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold hover:bg-primary-50 transition-all">Nous écrire</button>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Careers;
