import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Clock, Filter, ChevronRight, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DoctorSearch = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState(location.state?.specialty || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'price_asc', 'price_desc', 'experience'

  useEffect(() => {
    fetchDoctors(specialty);
  }, []);

  const fetchDoctors = async (spec = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/doctor/all${spec ? `?specialty=${spec}` : ''}`);
      setDoctors(res.data);
    } catch (err) {
      console.error("Erreur lors de la recherche des docteurs:", err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors(specialty);
  };

  const filteredDoctors = [...doctors].sort((a, b) => {
    if (sortBy === 'price_asc') return (a.price_per_consultation || 0) - (b.price_per_consultation || 0);
    if (sortBy === 'price_desc') return (b.price_per_consultation || 0) - (a.price_per_consultation || 0);
    if (sortBy === 'experience') return (b.experience_years || 0) - (a.experience_years || 0);
    return 0; // Default: initial order (might be rating from backend)
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute start-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
            <input 
              type="text"
              placeholder={t('specialty_placeholder')}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full ps-14 pe-6 py-4.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-white"
            />
          </div>
          <button 
            type="submit"
            className="bg-primary-600 text-white px-10 py-4.5 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95"
          >
            {t('search')}
          </button>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-gray-900 dark:text-white text-xl">
          {loading ? t('searching') : `${filteredDoctors.length} ${t('doctors_found')}`}
        </h3>
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl border ${
              showFilters 
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-600' 
                : 'text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-800 hover:text-primary-600'
            }`}
          >
            <Filter size={18} />
            {t('sort_by') || 'Trier par'}
          </button>

          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute end-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2">
                {[
                  { id: 'rating', label: t('sort_rating') || 'Mieux notés' },
                  { id: 'price_asc', label: t('sort_price_asc') || 'Prix croissant' },
                  { id: 'price_desc', label: t('sort_price_desc') || 'Prix décroissant' },
                  { id: 'experience', label: t('sort_experience') || 'Expérience' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => { setSortBy(option.id); setShowFilters(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      sortBy === option.id 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' 
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.id && <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 h-72 animate-pulse space-y-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl"></div>
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-50 dark:bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-gray-50 dark:bg-slate-800 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : filteredDoctors.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-800"
            >
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-slate-700">
                <Search size={40} />
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-lg font-bold">{t('no_doctors_found')}</p>
              <button onClick={() => setSpecialty('') || fetchDoctors()} className="mt-4 text-primary-600 font-bold hover:underline">
                {t('clear_search')}
              </button>
            </motion.div>
          ) : (
            filteredDoctors.map((doctor, i) => (
              <motion.div 
                key={doctor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-800 transition-all group relative overflow-hidden"
              >
                {/* Availability Badge */}
                <div className="absolute top-4 end-4 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100 dark:border-green-800">
                  {t('available') || 'Disponible'}
                </div>

                <div className="flex items-start gap-4 mb-6 pt-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary-600/20 group-hover:scale-110 transition-transform">
                    {doctor.user.first_name[0]}{doctor.user.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                      Dr. {doctor.user.first_name} {doctor.user.last_name}
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-bold mt-1">
                      {t(doctor.specialty) !== doctor.specialty ? t(doctor.specialty) : (doctor.specialty || t('general_practitioner'))}
                    </p>
                    <div className="flex items-center gap-1.5 text-yellow-500 text-xs mt-2">
                      <Star size={14} fill="currentColor" />
                      <span className="font-black text-gray-900 dark:text-white">4.9</span>
                      <span className="text-gray-400 dark:text-slate-500 font-bold">({t('reviews', { count: 48 })})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                      <MapPin size={16} />
                    </div>
                    <span className="font-medium">{t('morocco')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                      <Clock size={16} />
                    </div>
                    <span className="font-medium">{t('next_appt')} : <span className="text-primary-600 dark:text-primary-400 font-bold">{t('tomorrow')} 10:00</span></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('consultation_fee') || 'Tarif'}</span>
                    <span className="font-black text-gray-900 dark:text-white text-lg">{doctor.price_per_consultation || 300} MAD</span>
                  </div>
                  <Link 
                    to={`/patient/book/${doctor.id}`}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl text-sm font-black hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all shadow-lg"
                  >
                    {t('book_btn')}
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DoctorSearch;
