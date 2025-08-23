// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-lg">
        Se încarcă...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Dacă sunt specificate roluri permise, verificăm dacă rolul utilizatorului este inclus
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />; // Redirecționare la AccessDenied
  }

  // Dacă totul este în regulă, afișează conținutul rutei imbricate
  return <Outlet />;
};

export default PrivateRoute;