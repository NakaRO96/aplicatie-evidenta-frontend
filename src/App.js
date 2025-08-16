    import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import { ToastContainer } from 'react-toastify';
    import 'react-toastify/dist/React-toastify.css';

    import LoginPage from './pages/LoginPage';
    import AdminDashboard from './pages/AdminDashboard';
    import CreateAccountPage from './pages/CreateAccountPage';
    import UserDetailsPage from './pages/UserDetailsPage';
    import ChangePasswordPage from './pages/ChangePasswordPage';
    import NotFoundPage from './pages/NotFoundPage';
    import ClientDashboard from './pages/ClientDashboard; // NOU: Importă componenta Dashboard-ului Clientul'

    import { AuthProvider, useAuth } from './context/AuthContext';
    import Header from './components/Header';

    const PrivateRoute = ({ children, allowedRoles }) => {
      const { isAuthenticated, userRole } = useAuth();
      if (!isAuthenticated) {
        return <Navigate to="/login" />;
      }
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/login" />; 
      }
      return children;
    };

    function App() {
      return (
        <Router>
          <AuthProvider>
            <Header />
            
            <Routes>
              {/* Redirecționează '/' direct către '/login' */}
              <Route path="/" element={<Navigate to="/login" />} />
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
              <Route
                path="/admin/change-password"
                element={
                  <PrivateRoute allowedRoles={['admin', 'trainer', 'client']}>
                    <ChangePasswordPage />
                  </PrivateRoute>
                }
              />
              {/* MODIFICAT: Acum randează componenta dedicată ClientDashboardPage */}
              <Route
                path="/client-dashboard"
                element={
                  <PrivateRoute allowedRoles={['client']}>
                    <ClientDashboard /> {/* Utilizăm noua componentă aici */}
                  </PrivateRoute>
                }
              />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          </AuthProvider>
        </Router>
      );
    }

    export default App;
    