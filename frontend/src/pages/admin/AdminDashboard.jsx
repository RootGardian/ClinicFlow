import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, DollarSign, Calendar, 
  CheckCircle, XCircle, Shield, MoreVertical,
  Search, Filter, ChevronRight, UserCheck,
  TrendingUp, Clock, AlertCircle, UserMinus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import LoadingSpinner from '../../components/LoadingSpinner';

const getSocketUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://clinicflow-backend-wi33.onrender.com';
  return url.replace('/api', '');
};
const socket = io(getSocketUrl());

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [stats, setStats] = useState({ 
    doctors: 0, patients: 0, appointments: 0, revenue: 0, 
    recentAppointments: [], revenueData: [] 
  });
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors', 'users', 'stats'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();

    socket.on('payment_confirmed', () => {
      fetchData();
      toast.success("Nouveau paiement reçu ! Statistiques mises à jour.");
    });

    socket.on('appointment_updated', () => {
      fetchData();
    });

    return () => {
      socket.off('payment_confirmed');
      socket.off('appointment_updated');
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) { console.error("Stats Error:", err); }

    try {
      const doctorsRes = await api.get('/admin/doctors');
      setDoctors(doctorsRes.data);
    } catch (err) { console.error("Doctors Error:", err); }

    try {
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);
    } catch (err) { console.error("Users Error:", err); }
    
    setLoading(false);
  };

  const handleToggleVerify = async (doctorId, currentStatus) => {
    try {
      await api.patch(`/admin/doctors/${doctorId}/verify`, { status: !currentStatus });
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    toast((tId) => (
      <div className="flex flex-col gap-3">
        <span className="font-bold text-gray-900">
          Voulez-vous vraiment {currentStatus ? 'bloquer' : 'débloquer'} cet utilisateur ?
        </span>
        <div className="flex gap-2">
          <button 
            className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
            onClick={async () => {
              toast.dismiss(tId.id);
              try {
                await api.patch(`/admin/users/${userId}/status`, { is_active: !currentStatus });
                fetchData();
                toast.success('Statut modifié avec succès');
              } catch (err) {
                toast.error("Erreur lors de la modification du statut.");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
                <Shield size={24} />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">ClinicFlow Central</h1>
            </div>
            <p className="text-gray-500 font-medium">Panneau de contrôle de la plateforme de télémédecine.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="px-6 py-3 bg-white text-red-600 font-bold text-sm rounded-2xl shadow-sm border border-red-50 hover:bg-red-50 transition-all flex items-center gap-2"
            >
              <Activity size={18} />
              Déconnexion
            </button>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-gray-700">Mode Administrateur</span>
            </div>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Revenu Global', value: `${stats.revenue} MAD`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: '+12%' },
            { label: 'Médecins', value: stats.doctors, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+3' },
            { label: 'Patients', value: stats.patients, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+8%' },
            { label: 'Consultations', value: stats.appointments, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Stable' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:shadow-primary-500/5 transition-all cursor-default"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                  <stat.icon size={26} />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-gray-50 text-gray-400 rounded-lg">{stat.trend}</span>
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
            </motion.div>
          ))}
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            onClick={async () => {
              try {
                await api.post('/admin/reset-rate-limits');
                toast.success("Tous les blocages temporaires (IP) ont été levés.");
              } catch (err) {
                toast.error("Erreur lors de la réinitialisation.");
              }
            }}
            className="px-6 py-3 bg-orange-100 text-orange-700 font-bold text-xs rounded-2xl border border-orange-200 hover:bg-orange-200 transition-all flex items-center gap-2"
          >
            <AlertCircle size={16} />
            Réinitialiser Blocages Temporaires
          </button>
          <button 
            onClick={async () => {
              try {
                const res = await api.post('/admin/unblock-all');
                toast.success(res.data.message);
                fetchData();
              } catch (err) {
                toast.error("Erreur lors du déblocage global.");
              }
            }}
            className="px-6 py-3 bg-green-100 text-green-700 font-bold text-xs rounded-2xl border border-green-200 hover:bg-green-200 transition-all flex items-center gap-2"
          >
            <UserCheck size={16} />
            Réactiver Tous les Comptes
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex bg-gray-50 p-1.5 rounded-2xl">
                  {['doctors', 'users'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        activeTab === tab 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab === 'doctors' ? 'Vérification Praticiens' : 'Gestion Utilisateurs'}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Filtrer..." 
                    className="pl-12 pr-6 py-3 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  {activeTab === 'doctors' ? (
                    <>
                      <thead>
                        <tr className="text-left">
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Praticien</th>
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Licence</th>
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {doctors
                          .filter(d => `${d.user.first_name} ${d.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((doctor) => (
                          <tr key={doctor.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <img 
                                    src={doctor.user.avatar_url || `https://ui-avatars.com/api/?name=${doctor.user.first_name}+${doctor.user.last_name}&background=random`} 
                                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
                                  />
                                  {doctor.identity_verified && (
                                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
                                      <CheckCircle size={10} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">Dr. {doctor.user.first_name} {doctor.user.last_name}</p>
                                  <p className="text-xs text-gray-400 font-bold uppercase">{doctor.specialty || 'Généraliste'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 font-mono text-sm text-gray-500">{doctor.license_number || 'N/A'}</td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                doctor.identity_verified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 animate-pulse'
                              }`}>
                                {doctor.identity_verified ? 'Certifié' : 'À Valider'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => handleToggleVerify(doctor.id, doctor.identity_verified)}
                                className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                  doctor.identity_verified 
                                  ? 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600' 
                                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20'
                                }`}
                              >
                                {doctor.identity_verified ? 'Révoquer' : 'Approuver'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead>
                        <tr className="text-left">
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Rôle</th>
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
                          <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users
                          .filter(u => `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((user) => (
                          <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <img 
                                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random`} 
                                  className="w-10 h-10 rounded-xl object-cover"
                                />
                                <div>
                                  <p className="font-bold text-gray-900">{user.first_name} {user.last_name}</p>
                                  <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{user.role}</span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs font-bold text-gray-500">{user.is_active ? 'Actif' : 'Suspendu'}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                className={`p-2 rounded-xl transition-all ${
                                  user.is_active ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-red-500 bg-red-50 hover:bg-red-100'
                                }`}
                              >
                                {user.is_active ? <UserCheck size={18} /> : <UserMinus size={18} />}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Activité Récente</h3>
                <Clock className="text-gray-300" size={20} />
              </div>
              <div className="space-y-6">
                {stats.recentAppointments.length > 0 ? stats.recentAppointments.map((app, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== stats.recentAppointments.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-[-1.5rem] w-0.5 bg-gray-50"></div>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 relative z-10">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">Nouveau RDV pris</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Patient <span className="text-primary-600 font-bold">{app.patient.user.last_name}</span> avec Dr. <span className="text-primary-600 font-bold">{app.doctor.user.last_name}</span>
                      </p>
                      <p className="text-[10px] text-gray-300 font-bold uppercase mt-2">Il y a {Math.floor((Date.now() - new Date(app.created_at))/60000)} min</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-400 py-10">Aucune activité récente.</p>
                )}
              </div>
              <button className="w-full mt-8 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold text-xs hover:bg-gray-100 transition-all uppercase tracking-widest">
                Voir tous les logs
              </button>
            </div>

            {/* Platform Health */}
            <div className="bg-primary-600 rounded-[2.5rem] shadow-lg shadow-primary-600/20 p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={24} />
                <h3 className="text-xl font-bold tracking-tight">Performance</h3>
              </div>
              <p className="text-primary-100 text-sm leading-relaxed mb-6">
                La plateforme a enregistré une croissance de <span className="text-white font-bold">12%</span> ce mois-ci. Tous les services sont opérationnels.
              </p>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-3/4"></div>
              </div>
              <p className="text-[10px] font-bold mt-4 opacity-60 uppercase tracking-widest">Uptime: 99.9%</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
