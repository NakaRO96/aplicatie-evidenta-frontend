import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentele tale
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import CreateAccountPage from './pages/CreateAccountPage';
import UserDetailsPage from './pages/UserDetailsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import ClientDashboard from './pages/ClientDashboard';
import AttendanceDashboard from './components/AttendanceDashboard';
import AccessDenied from './pages/AccessDenied';
import SimulationsPage from './pages/SimulationsPage'; // NOU: Importat

// Contextul de autentificare și Header
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          {/* Rute publice */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Rute private pentru Administratori */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create-account" element={<CreateAccountPage />} />
            <Route path="/admin/users/:id" element={<UserDetailsPage />} />
            <Route path="/admin/attendance" element={<AttendanceDashboard />} />
            <Route path="/simulations" element={<SimulationsPage />} /> {/* NOU: Rută pentru simulări */}
          </Route>

          {/* Rută privată pentru schimbarea parolei (Admin & Client) */}
          <Route element={<PrivateRoute allowedRoles={['admin', 'client']} />}>
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Rută privată pentru Client Dashboard */}
          <Route element={<PrivateRoute allowedRoles={['client']} />}>
            <Route path="/client-dashboard" element={<ClientDashboard />} />
          </Route>

          {/* Ruta pentru paginile inexistente (404) */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </Router>
  );
}

export default App;