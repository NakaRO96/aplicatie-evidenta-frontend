import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import CreateAccountPage from './pages/CreateAccountPage';
import UserDetailsPage from './pages/UserDetailsPage';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword'; // Asigură-te că ai importat și ResetPassword
import { ToastContainer } from 'react-toastify'; // NOU: Importă ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // NOU: Importă stilurile CSS

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rute publice, accesibile fără autentificare */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-first-admin" element={<CreateAccountPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rute protejate pentru Admin */}
          <Route path="/admin" element={<PrivateRoute requiredRole="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="create-account" element={<CreateAccountPage />} />
            <Route path="users/:id" element={<UserDetailsPage />} />
          </Route>

          {/* Rută protejată pentru Client */}
          <Route path="/client" element={<PrivateRoute requiredRole="client" />}>
            <Route index element={<ClientDashboard />} />
          </Route>

          {/* Fallback pentru rute nedefinite */}
          <Route path="*" element={<h1 className="text-center text-4xl mt-20 text-red-600">404 - Pagina nu a fost găsită</h1>} />
        </Routes>
      </AuthProvider>
      <ToastContainer /> {/* NOU: Adaugă container-ul pentru notificări */}
    </Router>
  );
}

export default App;