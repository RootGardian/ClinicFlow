import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar, ChevronRight, Filter, X, FileText, Activity } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorPatients = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

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

  if (loading) return <LoadingSpinner text={t('loading')} />;

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

                <button 
                  onClick={() => setSelectedPatient(patient)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-black hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all shadow-lg active:scale-95 group"
                >
                  {t('view_medical_record')}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </m.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <m.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                    {selectedPatient.user.first_name[0]}{selectedPatient.user.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                      {selectedPatient.user.first_name} {selectedPatient.user.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Dossier Médical</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 transition-all hover:bg-gray-50"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Groupe Sanguin</span>
                    <span className="font-black text-gray-900 dark:text-white text-lg">{selectedPatient.blood_group || '-'}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Poids</span>
                    <span className="font-black text-gray-900 dark:text-white text-lg">{selectedPatient.weight ? `${selectedPatient.weight} kg` : '-'}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Taille</span>
                    <span className="font-black text-gray-900 dark:text-white text-lg">{selectedPatient.height ? `${selectedPatient.height} cm` : '-'}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1">Âge</span>
                    <span className="font-black text-gray-900 dark:text-white text-lg">
                      {selectedPatient.date_of_birth ? new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear() + " ans" : '-'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Activity size={18} className="text-primary-600" /> Allergies & Antécédents
                  </h4>
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 text-sm text-gray-700 dark:text-slate-300 min-h-[80px]">
                    {selectedPatient.allergies || 'Aucune allergie ou antécédent déclaré.'}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-primary-600" /> Documents Médicaux
                  </h4>
                  {(!selectedPatient.medical_documents || selectedPatient.medical_documents.length === 0) ? (
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 text-center text-sm text-gray-500 dark:text-slate-400">
                      Aucun document médical disponible pour ce patient.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedPatient.medical_documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-primary-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary-600 shadow-sm">
                              <FileText size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{doc.title}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button 
                            onClick={async () => {
                              try {
                                const filename = doc.file_url.split('/').pop();
                                const response = await api.get(`/doctor/documents/${filename}`, {
                                  responseType: 'blob'
                                });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', filename);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                              } catch (err) {
                                toast.error("Vous n'avez pas l'autorisation d'accéder à ce document ou le fichier n'existe plus.");
                              }
                            }}
                            className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-bold shadow-sm hover:bg-primary-50 transition-colors"
                          >
                            Ouvrir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorPatients;
