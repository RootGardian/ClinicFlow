import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = "w-20 h-20", text = "Chargement..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={size}
      >
        <img src="/logo.png" alt="ClinicFlow" className="w-full h-full object-contain" />
      </motion.div>
      {text && (
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
