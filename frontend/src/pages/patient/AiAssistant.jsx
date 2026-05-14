import React, { useState, useRef, useEffect } from 'react';
import PatientLayout from '../../components/PatientLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, ShieldCheck, ArrowRight, MessageSquare, Clock, Zap, Stethoscope, Brain, Heart, Bone, Eye, Baby, Activity, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AiAssistant = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [lastSymptoms, setLastSymptoms] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const cooldownRef = useRef(null);

  const quickSymptoms = [
    { label: t('symptom_headache') || 'Maux de tête', icon: '' },
    { label: t('symptom_fever') || 'Fièvre', icon: '' },
    { label: t('symptom_chest') || 'Douleur thoracique', icon: '' },
    { label: t('symptom_back') || 'Mal de dos', icon: '' },
    { label: t('symptom_nausea') || 'Nausées', icon: '' },
    { label: t('symptom_breathing') || 'Difficulté respiratoire', icon: '' },
  ];

  const specialtyIcons = {
    'Médecine Générale': Stethoscope,
    'Cardiologie': Heart,
    'Neurologie': Brain,
    'Orthopédie': Bone,
    'Rhumatologie': Bone,
    'Ophtalmologie': Eye,
    'Pédiatrie': Baby,
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(cooldownRef.current);
    }
  }, [cooldown]);

  const handleSend = async (retryText) => {
    const textToSend = retryText || input;
    if (!textToSend.trim() || loading || cooldown > 0) return;

    if (!hasStarted) setHasStarted(true);

    if (!retryText) {
      setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: textToSend }]);
      setLastSymptoms(textToSend);
      setInput('');
    }
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.text }));
      const res = await api.post('/ai/analyze-symptoms', {
        symptoms: textToSend,
        history,
        lang: i18n.language
      });
      setAnalysis(res.data);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: res.data.summary, analysis: res.data }]);
      setCooldown(0);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 429 && data?.type === "RATE_LIMIT") {
        setCooldown(data.retryAfter || 60);
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: t('ai_rate_limit'), isRateLimit: true }]);
      } else {
        const errorMsg = data?.error || data?.message || "L'assistant est momentanément indisponible.";
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: errorMsg }]);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSymptom = (label) => {
    if (loading || cooldown > 0) return;
    setInput(label);
    handleSend(label);
  };

  const formatTime = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, '0')}s` : `${s}s`;

  const getSpecialtyIcon = (specialty) => {
    const Icon = Object.entries(specialtyIcons).find(([key]) => specialty?.includes(key))?.[1] || Stethoscope;
    return Icon;
  };

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">

        {/* ═══ Welcome Screen (before first message) ═══ */}
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-4"
          >
            {/* Animated AI Icon */}
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary-600/30">
                <Sparkles size={40} className="text-white" />
              </div>
              <div className="absolute -top-2 -end-2 w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Activity size={16} className="text-white" />
              </div>
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-[2rem] border-2 border-primary-300 animate-ping opacity-20"></div>
            </motion.div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">{t('ai_assistant_title')}</h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-md mb-2">{t('ai_assistant_welcome')}</p>
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full font-bold mb-10 border border-green-100 dark:border-green-800">
              <ShieldCheck size={14} /> {t('ai_disclaimer')}
            </div>

            {/* Quick Symptoms Grid */}
            <div className="w-full max-w-lg">
              <p className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-4">{t('ai_quick_symptoms') || 'Symptômes fréquents'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickSymptoms.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleQuickSymptom(s.label)}
                    className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 hover:shadow-lg hover:shadow-primary-600/5 transition-all text-start group"
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-primary-700 dark:group-hover:text-primary-400">{s.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ Chat Interface (after first message) ═══ */}
        {hasStarted && (
          <>
            {/* Cooldown Banner */}
            <AnimatePresence>
              {cooldown > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                      <Clock size={20} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-100">{t('ai_rate_limit')}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">{t('ai_cooldown_sub') || 'Quota temporaire atteint'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden hidden sm:block">
                      <motion.div className="h-full bg-amber-500 rounded-full" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: cooldown, ease: 'linear' }} />
                    </div>
                    <div className="bg-amber-600 text-white px-3 py-1.5 rounded-lg font-mono font-bold text-sm min-w-[60px] text-center">{formatTime(cooldown)}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-5 pb-6 pe-2 custom-scrollbar">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.type === 'user' ? 'bg-slate-800 dark:bg-slate-200 dark:text-slate-900 text-white' :
                        msg.isRateLimit ? 'bg-amber-500 text-white' :
                          'bg-gradient-to-br from-primary-500 to-primary-700 text-white'
                        }`}>
                        {msg.type === 'user' ? <User size={16} /> : msg.isRateLimit ? <Clock size={16} /> : <Sparkles size={16} />}
                      </div>

                      {/* Message Bubble */}
                      <div className={`rounded-2xl shadow-sm ${msg.type === 'user'
                        ? 'bg-slate-800 dark:bg-slate-200 dark:text-slate-900 text-white px-5 py-3.5 rounded-tr-sm'
                        : msg.isRateLimit
                          ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 px-5 py-3.5 rounded-tl-sm'
                          : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-100 px-5 py-4 rounded-tl-sm'
                        }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>

                        {/* Rate limit retry */}
                        {msg.isRateLimit && cooldown === 0 && (
                          <button onClick={() => handleSend(lastSymptoms)}
                            className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all">
                            <Zap size={14} /> {t('ai_retry') || 'Réessayer'}
                          </button>
                        )}

                        {/* ═══ Analysis Results Card ═══ */}
                        {msg.analysis && (
                          <div className="mt-5 space-y-3">
                            {/* Specialty Card */}
                            {msg.analysis.suggestedSpecialty && msg.analysis.suggestedSpecialty !== 'N/A' && msg.analysis.suggestedSpecialty !== 'Aucune' && (
                              <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-900/10 rounded-xl p-4 border border-primary-100 dark:border-primary-800">
                                <p className="text-[10px] font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider mb-2">{t('ai_result_specialty')}</p>
                                <div className="flex items-center gap-3">
                                  {(() => { const Icon = getSpecialtyIcon(msg.analysis.suggestedSpecialty); return <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-primary-100 dark:border-primary-800"><Icon size={20} className="text-primary-600 dark:text-primary-400" /></div>; })()}
                                  <span className="text-base font-bold text-gray-900 dark:text-white">{msg.analysis.suggestedSpecialty}</span>
                                </div>
                              </div>
                            )}

                            {/* First Aid Card */}
                            {msg.analysis.firstAidAdvice && msg.analysis.firstAidAdvice !== 'N/A' && msg.analysis.firstAidAdvice !== 'Aucun' && (
                              <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/10 rounded-xl p-4 border border-green-100 dark:border-green-800">
                                <p className="text-[10px] font-bold text-green-500 dark:text-green-400 uppercase tracking-wider mb-2">{t('ai_result_first_aid')}</p>
                                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{msg.analysis.firstAidAdvice}</p>
                              </div>
                            )}

                            {/* Urgency Badge - Only if medical context */}
                            {msg.analysis.urgencyLevel && msg.analysis.suggestedSpecialty !== 'N/A' && (
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${msg.analysis.urgencyLevel === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' :
                                msg.analysis.urgencyLevel === 'medium' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800' :
                                  'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${msg.analysis.urgencyLevel === 'high' ? 'bg-red-500 animate-pulse' :
                                  msg.analysis.urgencyLevel === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                                  }`}></div>
                                {t(`urgency_${msg.analysis.urgencyLevel}`) || msg.analysis.urgencyLevel}
                              </div>
                            )}

                            {/* Booking Success Badge */}
                            {msg.analysis.bookingSuccess && (
                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                  <CheckCircle2 size={18} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">{t('ai_booking_confirmed') || 'RDV Confirmé'}</p>
                                  <button onClick={() => navigate('/patient/appointments')} className="text-[10px] text-green-600 dark:text-green-500 font-bold hover:underline">
                                    {t('ai_view_appointments') || 'Voir mes rendez-vous'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* CTA Button */}
                            {!msg.analysis.bookingSuccess && (
                              <motion.button
                                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/patient/search', { state: { specialty: msg.analysis.suggestedSpecialty } })}
                                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary-600/20 transition-all"
                              >
                                {t('ai_start_booking')} <ArrowRight size={18} />
                              </motion.button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg animate-pulse">
                    <Bot size={16} />
                  </div>
                  <div className="px-5 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl rounded-tl-sm flex items-center gap-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-slate-500 italic">{t('ai_thinking')}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}

        {/* ═══ Input Area ═══ */}
        <div className={`p-3 bg-white dark:bg-slate-900 border rounded-2xl shadow-xl flex items-center gap-3 transition-all ${cooldown > 0 ? 'border-amber-200 dark:border-amber-800 opacity-50' : hasStarted ? 'border-gray-200 dark:border-slate-800' : 'border-primary-200 dark:border-primary-800 shadow-primary-600/10'
          }`}>
          <div className="flex-1 flex items-center gap-2">
            {!hasStarted && <Sparkles size={18} className="text-primary-400 shrink-0 ms-2" />}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={cooldown > 0 ? `⏳ ${formatTime(cooldown)}...` : t('ai_assistant_placeholder')}
              disabled={cooldown > 0}
              className="flex-1 bg-transparent outline-none px-2 py-2.5 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 disabled:cursor-not-allowed text-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || loading || cooldown > 0}
            className={`p-3 rounded-xl transition-all ${input.trim() && cooldown === 0
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/25'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600'
              }`}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </PatientLayout>
  );
};

export default AiAssistant;
