import React, { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import api from '../../utils/api';
import { Search, MapPin, Star, Stethoscope, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PublicDoctorDirectory = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctor/all');
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => 
    doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PublicLayout>
      <div className="bg-gray-50 min-h-screen py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black text-gray-900 mb-4">{t('directory_title')}</h1>
            <p className="text-gray-500 text-lg">{t('directory_sub')}</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-16 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input 
              type="text"
              placeholder={t('directory_search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-primary-600/5 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-lg"
            />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {filteredDoctors.map((doc) => (
                <motion.div 
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 overflow-hidden border border-primary-50">
                        {doc.user.avatar_url ? (
                          <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://clinicflow-backend-wi33.onrender.com'}${doc.user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Stethoscope size={28} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Dr. {doc.user.last_name}</h3>
                        <p className="text-sm text-primary-600 font-bold">{doc.specialty}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="font-bold text-gray-700">4.9</span> ({t('reviews_count', { count: 120 })})
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={16} />
                        Casablanca, Maroc
                      </div>
                    </div>
                  </div>

                  <Link 
                    to="/register" 
                    className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm"
                  >
                    {t('take_appointment')} <ArrowRight size={18} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredDoctors.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 italic">{t('no_doctors_found')}</p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default PublicDoctorDirectory;
