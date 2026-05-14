import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ShieldCheck, ShieldAlert, Key, Copy, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MfaSetup = ({ user, onStatusChange }) => {
  const { t } = useTranslation();
  const [setupData, setSetupData] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(user.mfa_enabled);

  const initiateSetup = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/mfa/setup');
      setSetupData(res.data);
    } catch (error) {
      toast.error("Erreur lors de la configuration MFA");
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await api.post('/auth/mfa/verify', { token });
      toast.success("MFA activé avec succès !");
      setIsMfaEnabled(true);
      setSetupData(null);
      if (onStatusChange) onStatusChange(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir désactiver le MFA ? Votre compte sera moins sécurisé.")) return;
    setLoading(true);
    try {
      await api.post('/auth/mfa/disable');
      toast.success("MFA désactivé");
      setIsMfaEnabled(false);
      if (onStatusChange) onStatusChange(false);
    } catch (error) {
      toast.error("Erreur lors de la désactivation");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isMfaEnabled ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'}`}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white">Authentification à deux facteurs (MFA)</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Sécurisez votre compte avec Google Authenticator</p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isMfaEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-500'}`}>
          {isMfaEnabled ? 'Activé' : 'Désactivé'}
        </div>
      </div>

      {!isMfaEnabled && !setupData && (
        <button
          onClick={initiateSetup}
          disabled={loading}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
        >
          Activer le MFA
        </button>
      )}

      {setupData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-gray-200 dark:border-slate-700">
            <div className="bg-white p-4 rounded-2xl shadow-xl mb-4">
              <QRCodeSVG value={setupData.otpauth} size={180} />
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 font-medium mb-4">
              Scannez ce QR Code avec votre application d'authentification (Google Authenticator, Authy, etc.)
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-slate-800 text-xs font-mono text-gray-500 w-full justify-between">
              <span className="truncate">{setupData.secret}</span>
              <button onClick={() => copyToClipboard(setupData.secret)} className="text-primary-600 hover:text-primary-700">
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
              <Key size={14} className="text-primary-600" />
              Entrez le code à 6 chiffres
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                maxLength="6"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="flex-1 px-6 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-black text-center tracking-[0.5em] text-xl"
              />
              <button
                onClick={verifySetup}
                disabled={loading || token.length !== 6}
                className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 active:scale-95"
              >
                Vérifier
              </button>
            </div>
          </div>
          
          <button onClick={() => setSetupData(null)} className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
            Annuler la configuration
          </button>
        </div>
      )}

      {isMfaEnabled && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-green-800 dark:text-green-400 font-medium leading-relaxed">
              Votre compte est protégé par l'authentification à deux facteurs. Vous devrez saisir un code généré par votre application à chaque connexion.
            </p>
          </div>
          <button
            onClick={disableMfa}
            disabled={loading}
            className="w-full py-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl font-black hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            Désactiver le MFA
          </button>
        </div>
      )}
    </div>
  );
};

export default MfaSetup;
