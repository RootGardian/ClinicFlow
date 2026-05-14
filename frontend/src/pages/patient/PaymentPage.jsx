import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CreditCard, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const stripePromise = loadStripe('pk_test_51TKdreHTTgYbk5AbmdIxHtghkUsUDjUoU2YDiPmV3G80IA0fFBBLvA1eXK1thbthuLl0PiHrCuAU6RVb7EIPJHn3002GBq5FOq');

const CheckoutForm = ({ clientSecret, onResult }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        try {
          await api.post('/payment/confirm', { payment_intent_id: clientSecret.split('_secret')[0] });
          onResult(true);
        } catch (err) {
          console.error("Erreur confirmation serveur (Stripe OK):", err);
          onResult(true);
        }
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-inner">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: isDarkMode ? '#f8fafc' : '#1e293b',
              '::placeholder': { color: isDarkMode ? '#64748b' : '#94a3b8' },
              iconColor: isDarkMode ? '#0d9488' : '#0d9488',
            },
            invalid: {
              color: '#ef4444',
            }
          },
        }} />
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="flex items-start gap-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm border border-red-100 dark:border-red-800"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" /> 
          <span>{error}</span>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4.5 rounded-2xl font-bold hover:shadow-xl hover:shadow-primary-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>{t('confirm_payment_btn')} <ShieldCheck size={20} /></>
        )}
      </button>

      <div className="flex items-center justify-center gap-4 py-2 opacity-50">
        <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 font-medium">
          <Lock size={12} /> {t('secure_stripe_msg')}
        </p>
      </div>
    </form>
  );
};

const PaymentPage = () => {
  const { t } = useTranslation();
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const { data } = await api.post('/payment/create-intent', { appointment_id: appointmentId });
        setClientSecret(data.clientSecret);
      } catch (err) {
        const errorMsg = err.response?.data?.message;
        if (errorMsg === 'Ce rendez-vous est déjà payé.') {
          setSuccess(true);
        } else {
          console.error('PAYMENT_INTENT_ERROR:', err);
          setError(errorMsg || t('init_payment_error'));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchIntent();
  }, [appointmentId, t]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate(`/patient/consultation/${appointmentId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, appointmentId, navigate]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 text-center border border-gray-100 dark:border-slate-800"
        >
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="text-green-600 dark:text-green-400" size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">{t('payment_success_title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-10 leading-relaxed">
            {t('payment_success_msg')} <br/>
            <span className="font-bold text-primary-600 dark:text-primary-400 mt-2 block">{t('redirection_msg')}</span>
          </p>
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <LoadingSpinner text={t('loading')} />
    </div>
  );

  return (
    <div className="min-h-screen medical-bg dark:bg-slate-950 py-20 px-6 transition-colors">
      <div className="max-w-md mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-bold transition-all group"
        >
          <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm group-hover:bg-gray-50">
            <CreditCard size={18} />
          </div>
          {t('back')}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 border border-gray-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-5 mb-12">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-primary-600/20">
              <CreditCard size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{t('payment_consultation_title')}</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{t('secure_by_stripe')}</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-2xl flex items-start gap-4 mb-8"
              >
                <AlertCircle className="text-red-600 dark:text-red-400 mt-1 shrink-0" size={24} />
                <div>
                  <p className="text-sm font-bold text-red-900 dark:text-red-200">{t('error_loading') || t('load_error')}</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1 leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                clientSecret={clientSecret} 
                onResult={setSuccess}
              />
            </Elements>
          )}

          {/* Trust Badges */}
          <div className="mt-10 pt-8 border-t border-gray-50 dark:border-slate-800 flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Visa</div>
            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Mastercard</div>
            <div className="text-xs font-black uppercase tracking-widest text-gray-400">PCI-DSS</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
