import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Non connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Rôle non autorisé
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Rediriger vers sa propre page d'accueil selon son rôle
    const home = user.role === 'doctor' ? '/doctor/dashboard' : '/patient/search';
    return <Navigate to={home} replace />;
  }

  return children;
};

export default ProtectedRoute;
