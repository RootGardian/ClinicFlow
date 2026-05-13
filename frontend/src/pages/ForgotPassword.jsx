import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Activity, ShieldCheck, Key } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setMessage('Code envoyé ! Vérifiez vos emails.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setMessage('Mot de passe modifié avec succès !');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
      >
        <div className="mb-8 flex justify-between items-center">
          <Link to="/login" className="text-gray-400 hover:text-primary-600 transition-all flex items-center gap-2 text-sm font-medium">
            <ArrowLeft size={18} /> Retour
          </Link>
          <div className="inline-flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Activity className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">ClinicFlow</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Récupération</h2>
          <p className="text-gray-500 mt-2">
            {step === 1 ? 'Saisissez votre email pour recevoir un code.' : 'Saisissez le code reçu et votre nouveau mot de passe.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Recevoir le code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Code OTP</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-center tracking-[10px] font-bold text-lg"
                  placeholder="000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={20} /> {loading ? 'Réinitialisation...' : 'Réinitialiser'}
            </button>
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-400 hover:text-gray-600 font-medium"
            >
              Renvoyer le code
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
