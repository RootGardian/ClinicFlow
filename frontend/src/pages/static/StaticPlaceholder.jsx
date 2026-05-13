import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import { Rocket, Construction, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const StaticPlaceholder = () => {
  const location = useLocation();
  const path = location.pathname.replace('/', '');
  const title = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100"
        >
          <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-10">
            <Rocket size={48} className="animate-bounce" />
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 mb-6">
            Bientôt disponible : <span className="text-primary-600">{title === 'Careers' ? 'Carrières' : title === 'Press' ? 'Presse' : title}</span>
          </h1>
          
          <p className="text-xl text-gray-500 leading-relaxed mb-10">
            Nous travaillons dur pour vous proposer cette section très prochainement. ClinicFlow évolue chaque jour pour mieux vous servir.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/" className="w-full sm:w-auto bg-primary-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all flex items-center justify-center gap-2">
              <ArrowLeft size={20} /> Retour à l'accueil
            </Link>
            <Link to="/contact" className="w-full sm:w-auto bg-gray-50 text-gray-900 px-10 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all">
              Nous contacter
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Construction size={16} /> Section en cours de développement
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default StaticPlaceholder;
