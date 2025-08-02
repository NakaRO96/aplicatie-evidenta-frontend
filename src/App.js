import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import CreateAccountPage from './pages/CreateAccountPage';
import UserDetailsPage from './pages/UserDetailsPage';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rute publice, accesibile fără autentificare */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-first-admin" element={<CreateAccountPage />} /> {/* Ruta specifică pentru crearea primului admin, rămâne publică */}
          <Route path="/" element={<Navigate to="/login" replace />} /> {/* Redirecționează la login ca pagină principală */}

          {/* Rute protejate pentru Admin */}
          <Route path="/admin" element={<PrivateRoute requiredRole="admin" />}>
            <Route index element={<AdminDashboard />} /> {/* /admin */}
            <Route path="create-account" element={<CreateAccountPage />} /> {/* RE-ADAUGAT: Ruta pentru crearea de conturi NOI, protejată de admin */}
            <Route path="users/:id" element={<UserDetailsPage />} /> {/* /admin/users/:id */}
          </Route>

          {/* Rută protejată pentru Client */}
          <Route path="/client" element={<PrivateRoute requiredRole="client" />}>
            <Route index element={<ClientDashboard />} /> {/* /client */}
          </Route>

          {/* Fallback pentru rute nedefinite */}
          <Route path="*" element={<h1 className="text-center text-4xl mt-20 text-red-600">404 - Pagina nu a fost găsită</h1>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;