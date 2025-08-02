import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-lg">Se încarcă...</div>;
  }

  // Dacă nu e autentificat, redirecționează la pagina de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Dacă este autentificat, dar nu are rolul necesar, redirecționează la login
  // Sau, alternativ, la o pagină de eroare "Acces Nepermis"
  if (requiredRole && user.role !== requiredRole) {
    // Poți naviga și la o pagină de "acces refuzat"
    return <Navigate to="/login" replace />;
  }

  // Dacă totul este în regulă, afișează conținutul rutei imbricate
  return <Outlet />;
};

export default PrivateRoute;