import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar, ChevronRight, Loader2, Filter } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useTranslation } from 'react-i18next';

const DoctorPatients = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/doctor/patients');
        setPatients(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des patients:", err);
      }
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    `${p.user.first_name} ${p.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
      <p className="text-gray-400 font-medium animate-pulse">{t('loading')}</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_patient_placeholder') || "Rechercher un patient..."}
            className="w-full pl-14 pr-6 py-4.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
          />
        </div>
        
        <button className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm w-full md:w-auto">
          <Filter size={18} />
          {t('filters') || 'Filtres'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPatients.length === 0 ? (
            <m.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-800"
            >
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-slate-700">
                <User size={40} />
              </div>
              <p className="text-gray-500 dark:text-slate-400 font-bold text-lg">{t('no_patients_msg')}</p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="mt-4 text-primary-600 font-bold hover:underline">
                  Effacer la recherche
                </button>
              )}
            </m.div>
          ) : (
            filteredPatients.map((patient, i) => (
              <m.div 
                key={patient.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-800 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary-600/20 group-hover:scale-110 transition-transform">
                    {patient.user.first_name[0]}{patient.user.last_name[0]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate text-lg leading-tight">
                      {patient.user.first_name} {patient.user.last_name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-500 font-bold mt-1 tracking-wide uppercase">
                      {t('patient_since')} {new Date(patient.user.created_at).getFullYear()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8 bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                      <Mail size={14} className="text-primary-600" />
                    </div>
                    <span className="truncate font-medium">{patient.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                      <Phone size={14} className="text-primary-600" />
                    </div>
                    <span className="font-medium">{patient.phone || t('not_provided')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                      <Calendar size={14} className="text-primary-600" />
                    </div>
                    <span className="font-medium">{t('born_on')} {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : t('not_provided')}</span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-black hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all shadow-lg active:scale-95 group">
                  {t('view_medical_record')}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </m.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DoctorPatients;
