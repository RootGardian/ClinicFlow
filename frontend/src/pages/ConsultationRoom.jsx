import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  Send, MessageSquare, Users, Activity, X,
  FileText, CheckCircle, AlertCircle, Upload, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import toast from 'react-hot-toast';

const getSocketUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://clinicflow-backend-wi33.onrender.com';
  return url.replace('/api', '');
};
const socket = io(getSocketUrl());

const ConsultationRoom = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // États
  const [jitsiApi, setJitsiApi] = useState(null);
  const [jitsiLoading, setJitsiLoading] = useState(true);
  const [jitsiError, setJitsiError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [prescriptionSent, setPrescriptionSent] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // États Ordonnance
  const [medications, setMedications] = useState([{ med: '', dosage: '' }]);
  const [advice, setAdvice] = useState('');
  const [existingPrescription, setExistingPrescription] = useState(null);
  
  const chatEndRef = useRef(null);

  const downloadFile = async (fileUrl, fileName) => {
    try {
      const filename = fileUrl.split('/').pop();
      const response = await api.get(`/patient/documents/${filename}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error(t('error_file_access'));
    }
  };

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const res = await api.get(`/patient/appointments`);
        const currentApp = res.data.find(a => a.id === parseInt(appointmentId));
        if (user?.role === 'patient' && currentApp && !currentApp.is_paid) {
          navigate(`/patient/payment/${appointmentId}`);
          return;
        }
      } catch (err) {
        console.error("Erreur vérification paiement:", err);
      }
    };

    const fetchPrescription = async () => {
      try {
        const res = await api.get(`/consultation/${appointmentId}`);
        if (res.data.prescription) {
          setExistingPrescription(res.data.prescription);
        }
      } catch (err) { console.error(err); }
    };

    if (user?.role === 'patient') {
      checkPayment();
    }
    fetchPrescription();

    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
      } else {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => initJitsi();
        script.onerror = () => setJitsiError(t('error_video_service'));
        document.body.appendChild(script);
      }
    };

    loadJitsiScript();

    socket.emit('join_consultation', appointmentId);
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    if (user?.role === 'doctor') {
      const fetchPatient = async () => {
        setLoadingPatient(true);
        try {
          const res = await api.get('/doctor/appointments');
          const currentApp = res.data.find(a => a.id === parseInt(appointmentId));
          setPatientData(currentApp?.patient);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingPatient(false);
        }
      };
      fetchPatient();
    }

    return () => {
      if (jitsiApi) jitsiApi.dispose();
      socket.off('receive_message');
    };
  }, [appointmentId, user, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initJitsi = () => {
    try {
      const container = document.getElementById('jitsi-container');
      if (!container) return;
      container.innerHTML = '';
      const domain = 'meet.jit.si';
      const options = {
        roomName: `Meeting-Room-Secured-${appointmentId}-442211`,
        width: '100%',
        height: '100%',
        parentNode: container,
        userInfo: { displayName: `${user?.first_name} ${user?.last_name}` },
        configOverwrite: {
          prejoinPageEnabled: false,
          enableLobby: false,
          disableDeepLinking: true,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
      };
      const jitsiInstance = new window.JitsiMeetExternalAPI(domain, options);
      setJitsiApi(jitsiInstance);
      setJitsiLoading(false);
    } catch (err) {
      setJitsiError(t('error_init_video'));
      setJitsiLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const msgData = {
      roomId: appointmentId,
      text: inputMessage,
      senderId: user.id,
      senderName: `${user.first_name} ${user.last_name}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit('send_message', msgData);
    setInputMessage('');
  };

  const toggleAudio = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleAudio');
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleVideo');
      setIsVideoOff(!isVideoOff);
    }
  };

  const addMedication = () => setMedications([...medications, { med: '', dosage: '' }]);
  const removeMedication = (index) => setMedications(medications.filter((_, i) => i !== index));

  const handleSendPrescription = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/prescription', { 
        appointmentId, 
        content: medications,
        advice: advice
      });
      setPrescriptionSent(true);
      setExistingPrescription(res.data.prescription);
      setTimeout(() => {
        setShowPrescription(false);
        setPrescriptionSent(false);
        // Rediriger vers le dashboard après succès
        if (user?.role === 'doctor') {
          navigate('/doctor/dashboard');
        }
      }, 3000);
    } catch (err) {
      toast.error(t('error_sending_prescription'));
    }
  };

  const downloadPrescription = async () => {
    if (!existingPrescription) return;
    try {
      const response = await api.get(`/prescription/${existingPrescription.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ordonnance-${existingPrescription.reference_num}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error(t('error_download'));
    }
  };

  const handleQuit = () => {
    if (jitsiApi) jitsiApi.dispose();
    if (user?.role === 'doctor') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/patient/appointments');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col overflow-hidden z-[50]">
      {/* Loading Overlay */}
      {jitsiLoading && !jitsiError && (
        <div className="absolute inset-0 bg-gray-900 z-[60] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold text-white">{t('connecting_secured_room')}</h2>
          <p className="text-gray-400 mt-2">{t('please_wait')}</p>
        </div>
      )}

      {/* Error Overlay */}
      {jitsiError && (
        <div className="absolute inset-0 bg-gray-900 z-[60] flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white">{jitsiError}</h2>
          <button onClick={() => window.location.reload()} className="mt-6 px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold">{t('retry')}</button>
        </div>
      )}

      {/* Prescription Modal */}
      <AnimatePresence>
        {showPrescription && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FileText className="text-primary-600" size={24} />
                  {t('prescription_title')}
                </h3>
                <button onClick={() => setShowPrescription(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {prescriptionSent ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} />
                  </div>
                  <p className="font-bold text-green-600 dark:text-green-400 text-lg">{t('prescription_success')}</p>
                </div>
              ) : (
                <form onSubmit={handleSendPrescription} className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">{t('medications')}</label>
                    {medications.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="flex-1 space-y-3">
                          <input 
                            required
                            placeholder={t('med_placeholder')}
                            className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400"
                            value={item.med}
                            onChange={(e) => {
                              const newMeds = [...medications];
                              newMeds[index].med = e.target.value;
                              setMedications(newMeds);
                            }}
                          />
                          <input 
                            required
                            placeholder={t('dosage_placeholder')}
                            className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                            value={item.dosage}
                            onChange={(e) => {
                              const newMeds = [...medications];
                              newMeds[index].dosage = e.target.value;
                              setMedications(newMeds);
                            }}
                          />
                        </div>
                        {medications.length > 1 && (
                          <button type="button" onClick={() => removeMedication(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl">
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={addMedication}
                      className="text-primary-600 font-bold text-sm hover:underline"
                    >
                      {t('add_med')}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">{t('advice_label')}</label>
                    <textarea 
                      value={advice}
                      onChange={(e) => setAdvice(e.target.value)}
                      className="w-full px-5 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 resize-none text-gray-900 dark:text-white placeholder-gray-400"
                      rows={3}
                      placeholder={t('advice_placeholder')}
                    />
                  </div>

                  <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20">
                    {t('validate_generate')}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Patient Info Modal */}
      <AnimatePresence>
        {showPatientInfo && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8 border-b dark:border-slate-800 pb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('patient_record')}</h3>
                  <p className="text-gray-500 dark:text-slate-400">{t('patient_record_sub')}</p>
                </div>
                <button onClick={() => setShowPatientInfo(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-xl">
                  <X size={24} />
                </button>
              </div>

              {loadingPatient ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">{t('loading_record')}</p>
                </div>
              ) : patientData ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl text-center">
                      <p className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase mb-1">{t('blood_group')}</p>
                      <p className="text-lg font-bold text-primary-900 dark:text-white">{patientData.blood_group || '--'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase mb-1">{t('weight')}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{patientData.weight ? `${patientData.weight} kg` : '--'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase mb-1">{t('height')}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{patientData.height ? `${patientData.height} cm` : '--'}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-center">
                      <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase mb-1">{t('age')}</p>
                      <p className="text-lg font-bold text-red-900 dark:text-white">
                        {patientData.date_of_birth ? `${new Date().getFullYear() - new Date(patientData.date_of_birth).getFullYear()} ${t('years')}` : '--'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-3xl border border-orange-100 dark:border-orange-800">
                    <h4 className="font-bold text-orange-900 dark:text-orange-400 mb-2 flex items-center gap-2">
                      <AlertCircle size={18} />
                      {t('allergies_title')}
                    </h4>
                    <p className="text-orange-800 dark:text-orange-200 text-sm">{patientData.allergies || t('no_allergies')}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-primary-600" />
                      {t('docs_analyses')}
                    </h4>
                    <div className="space-y-3">
                      {patientData.medical_documents?.length > 0 ? (
                        patientData.medical_documents.map((doc) => (
                          <button 
                            key={doc.id}
                            onClick={() => downloadFile(doc.file_url, doc.title)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-primary-600 border border-gray-100 dark:border-slate-700">
                                <FileText size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm text-left">{doc.title}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider text-left">{doc.file_type}</p>
                              </div>
                            </div>
                            <Upload size={18} className="text-gray-300 group-hover:text-primary-600" />
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm italic py-4 text-center">{t('no_docs')}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-gray-500">{t('record_not_available')}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="h-16 bg-gray-800/50 backdrop-blur-md border-b border-gray-700 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <Activity className="text-white" size={18} />
          </div>
          <span className="text-white font-bold tracking-wide">{t('live_consultation')}</span>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-bold animate-pulse">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            {t('live_badge')}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {existingPrescription && (
            <button 
              onClick={downloadPrescription}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-600/20"
            >
              <Download size={16} />
              {t('download_prescription')}
            </button>
          )}
          <div className="text-gray-400 text-sm font-medium">ID: {appointmentId}</div>
        </div>
      </div>

      <div className="flex-1 flex relative">
        <div id="jitsi-container" className="flex-1 bg-black"></div>
        <AnimatePresence>
          {showChat && (
            <motion.div 
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col shadow-2xl z-30"
            >
              <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary-600" />
                  {t('medical_chat')}
                </h3>
                <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.senderId === user.id 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                      {msg.senderId === user.id ? t('me') : msg.senderName} • {msg.time}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
                <div className="relative">
                  <input 
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={t('type_message')}
                    className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md">
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-24 bg-gray-800/80 backdrop-blur-xl flex items-center justify-center gap-6 px-10 z-20">
        <button 
          onClick={toggleAudio}
          className={`p-4 rounded-2xl transition-all shadow-lg ${
            isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button 
          onClick={toggleVideo}
          className={`p-4 rounded-2xl transition-all shadow-lg ${
            isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
        <div className="h-10 w-px bg-gray-600 mx-2"></div>
        <button 
          onClick={() => setShowChat(!showChat)}
          className={`p-4 rounded-2xl transition-all shadow-lg relative ${
            showChat ? 'bg-primary-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          <MessageSquare size={24} />
          {messages.length > 0 && !showChat && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800 animate-bounce"></span>
          )}
        </button>
        {user?.role === 'doctor' && (
          <div className="flex gap-2">
            <button 
              onClick={() => setShowPrescription(true)}
              className="p-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-lg flex items-center gap-2"
            >
              <FileText size={24} />
              <span className="hidden md:inline font-bold">{t('prescription_btn')}</span>
            </button>
            <button 
              onClick={() => setShowPatientInfo(true)}
              className="p-4 bg-gray-700 text-white rounded-2xl hover:bg-gray-600 transition-all shadow-lg flex items-center gap-2"
            >
              <Users size={24} />
              <span className="hidden md:inline font-bold">{t('folder_btn')}</span>
            </button>
          </div>
        )}
        <button 
          onClick={handleQuit}
          className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-xl shadow-red-500/30 flex items-center gap-2 active:scale-95"
        >
          <PhoneOff size={20} />
          {t('quit')}
        </button>
      </div>
    </div>
  );
};


export default ConsultationRoom;
