import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Trash2, 
  AlertCircle, 
  File as FileIcon, 
  Image as ImageIcon
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://clinicflow-backend-wi33.onrender.com';
  return url.replace('/api', '');
};
const socket = io(getSocketUrl());

const PatientDocuments = () => {
  const { t } = useTranslation();
  const { user } = useAuth(); // Import useAuth to check patient id if needed, though we can just fetch
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchDocuments();
    
    // Listen for real-time updates
    socket.on('prescription_generated', (data) => {
      // Refresh documents if this patient is concerned
      fetchDocuments();
    });

    return () => {
      socket.off('prescription_generated');
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/patient/medical-info');
      setDocuments(res.data.medical_documents || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des documents:", err);
    }
    setLoading(false);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      await api.post('/patient/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDocuments();
      toast.success(t('upload_success') || 'Document importé avec succès');
    } catch (err) {
      toast.error(err.response?.data?.message || t('load_error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDelete = async (id) => {
    toast((tId) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-gray-900">{t('confirm_delete_doc')}</span>
        <div className="flex gap-2">
          <button 
            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
            onClick={async () => {
              toast.dismiss(tId.id);
              try {
                await api.delete(`/patient/documents/${id}`);
                fetchDocuments();
                toast.success('Document supprimé');
              } catch (err) {
                console.error("Erreur lors de la suppression:", err);
                toast.error('Erreur lors de la suppression');
              }
            }}
          >
            Confirmer
          </button>
          <button 
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm"
            onClick={() => toast.dismiss(tId.id)}
          >
            Annuler
          </button>
        </div>
      </div>
    ));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

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
      toast.error(t('error_download'));
    }
  };

  if (loading) return <LoadingSpinner text={t('loading_docs')} />;

  return (
    <div className="space-y-8 pb-10">

      {/* Upload Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-[2.5rem] p-10 text-center transition-all ${
          dragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-inner' 
            : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'
        }`}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={(e) => handleUpload(e.target.files[0])}
          disabled={uploading}
        />
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${
            uploading ? 'bg-primary-600 text-white animate-pulse' : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
          }`}>
            <Upload size={32} />
          </div>
          <p className="text-gray-900 dark:text-white font-bold text-lg">
            {uploading ? t('uploading_msg') : t('drop_docs_here')}
          </p>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            {t('upload_support_msg')}
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, i) => (
          <motion.div 
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-800 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                doc.file_type === 'PDF' 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' 
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400'
              }`}>
                {doc.file_type === 'PDF' ? <FileIcon size={24} /> : <ImageIcon size={24} />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate max-w-[180px]">{doc.title}</h4>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {t('added_on')} {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => downloadFile(doc.file_url, doc.title)}
                className="p-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                title={t('download')}
              >
                <FileText size={20} />
              </button>
              <button 
                onClick={() => handleDelete(doc.id)}
                className="p-2.5 text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title={t('delete')}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {documents.length === 0 && !uploading && (
        <div className="text-center py-20 bg-gray-50/50 dark:bg-slate-900/20 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-800">
          <AlertCircle className="mx-auto text-gray-200 dark:text-slate-800 mb-4" size={48} />
          <p className="text-gray-400 dark:text-slate-500 italic font-medium">{t('no_docs_msg')}</p>
        </div>
      )}
    </div>
  );
};

export default PatientDocuments;
