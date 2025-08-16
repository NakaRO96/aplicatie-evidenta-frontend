import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CreateAccountPage from './pages/CreateAccountPage';
import UserDetailsPage from './pages/UserDetailsPage';
import ChangePasswordPage from './pages/ChangePasswordPage'; // NOU: Importă noua pagină de schimbare a parolei
import NotFoundPage from './pages/NotFoundPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header'; // NOU: Importă componenta Header

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Navighează către o pagină de "acces neautorizat" sau înapoi la login,
    // în funcție de logica dorită pentru utilizatorii fără rolul necesar.
    // Aici, am lăsat navigherea către '/' care duce la /admin.
    return <Navigate to="/" />; 
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* NOU: Adaugă Header-ul aici pentru a fi vizibil pe toate paginile */}
        {/* Acesta va apărea deasupra conținutului rutelor */}
        <Header />
        
        <Routes>
          <Route path="/" element={<Navigate to="/admin" />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['admin', 'trainer']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/create-account"
            element={
              <PrivateRoute allowedRoles={['admin', 'trainer']}>
                <CreateAccountPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <PrivateRoute allowedRoles={['admin', 'trainer']}>
                <UserDetailsPage />
              </PrivateRoute>
            }
          />
          {/* NOU: Ruta pentru pagina de schimbare a parolei */}
          <Route
            path="/admin/change-password"
            element={
              <PrivateRoute allowedRoles={['admin', 'trainer']}>
                <ChangePasswordPage />
              </PrivateRoute>
            }
          />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {/* ToastContainer pentru notificări (rămas așa cum era) */}
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </AuthProvider>
    </Router>
  );
}

export default App;
