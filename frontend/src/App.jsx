import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useEffect } from 'react';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Lazy loading components
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const DoctorLayout = lazy(() => import('./components/DoctorLayout'));
const PatientLayout = lazy(() => import('./components/PatientLayout'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorProfile = lazy(() => import('./pages/doctor/DoctorProfile'));
const DoctorAgenda = lazy(() => import('./pages/doctor/DoctorAgenda'));
const DoctorPatients = lazy(() => import('./pages/doctor/DoctorPatients'));
const DoctorWallet = lazy(() => import('./pages/doctor/DoctorWallet'));
const DoctorSearch = lazy(() => import('./pages/patient/DoctorSearch'));
const AppointmentBooking = lazy(() => import('./pages/patient/AppointmentBooking'));
const PatientMedicalRecord = lazy(() => import('./pages/patient/PatientMedicalRecord'));
const PatientDocuments = lazy(() => import('./pages/patient/PatientDocuments'));
const PatientAppointments = lazy(() => import('./pages/patient/PatientAppointments'));
const PaymentPage = lazy(() => import('./pages/patient/PaymentPage'));
const ConsultationRoom = lazy(() => import('./pages/ConsultationRoom'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const AiAssistant = lazy(() => import('./pages/patient/AiAssistant'));
const Security = lazy(() => import('./pages/static/Security'));
const Features = lazy(() => import('./pages/static/Features'));
const About = lazy(() => import('./pages/static/About'));
const Legal = lazy(() => import('./pages/static/Legal'));
const Contact = lazy(() => import('./pages/static/Contact'));
const Help = lazy(() => import('./pages/static/Help'));
const Privacy = lazy(() => import('./pages/static/Privacy'));
const Pricing = lazy(() => import('./pages/static/Pricing'));
const PublicDoctorDirectory = lazy(() => import('./pages/static/PublicDoctorDirectory'));
const Blog = lazy(() => import('./pages/static/Blog'));
const Careers = lazy(() => import('./pages/static/Careers'));
const Press = lazy(() => import('./pages/static/Press'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);


import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/security" element={<Security />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<Help />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/doctor-directory" element={<PublicDoctorDirectory />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/press" element={<Press />} />

              {/* Routes Docteur */}
              <Route path="/doctor/*" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Routes>
                    <Route path="/" element={<DoctorLayout children={<DoctorDashboard />} />} />
                    <Route path="/dashboard" element={<DoctorLayout children={<DoctorDashboard />} />} />
                    <Route path="/profile" element={<DoctorLayout children={<DoctorProfile />} />} />
                    <Route path="/agenda" element={<DoctorLayout children={<DoctorAgenda />} />} />
                    <Route path="/patients" element={<DoctorLayout children={<DoctorPatients />} />} />
                    <Route path="/wallet" element={<DoctorLayout children={<DoctorWallet />} />} />
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Routes Patient */}
              <Route path="/patient/*" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Routes>
                    <Route path="/" element={<PatientLayout children={<DoctorSearch />} />} />
                    <Route path="/search" element={<PatientLayout children={<DoctorSearch />} />} />
                    <Route path="/appointments" element={<PatientLayout children={<PatientAppointments />} />} />
                    <Route path="/book/:doctorId" element={<PatientLayout children={<AppointmentBooking />} />} />
                    <Route path="/medical-info" element={<PatientLayout children={<PatientMedicalRecord />} />} />
                    <Route path="/documents" element={<PatientLayout children={<PatientDocuments />} />} />
                    <Route path="/profile" element={<PatientLayout children={<PatientMedicalRecord />} />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/ai-assistant" element={<AiAssistant />} />
                    <Route path="/payment/:appointmentId" element={<PaymentPage />} />
                    <Route path="/consultation/:appointmentId" element={<ConsultationRoom />} />
                  </Routes>
                </ProtectedRoute>
              } />

              <Route path="/consultation/:appointmentId" element={
                <ProtectedRoute allowedRoles={['doctor', 'patient']}>
                  <ConsultationRoom />
                </ProtectedRoute>
              } />

              {/* Administration (Accès direct URL) */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </Router>
    </AuthProvider>

  );
};

export default App;
