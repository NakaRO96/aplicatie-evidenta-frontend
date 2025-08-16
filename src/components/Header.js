// src/components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, userRole, isAuthenticated } = useAuth(); // Am preluat isAuthenticated

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false); // Închide meniul după deconectare
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false); // Închide meniul după click
  };

  return (
    <header className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo sau titlu - adaptează textul în funcție de rol și dacă e autentificat */}
        <Link 
          to={isAuthenticated ? (userRole === 'admin' || userRole === 'trainer' ? "/admin" : "/client-dashboard") : "/login"} 
          onClick={handleLinkClick} 
          className="text-2xl font-bold text-blue-700 hover:text-blue-900 transition-colors duration-200"
        >
          {isAuthenticated ? (userRole === 'admin' || userRole === 'trainer' ? "Panou Admin" : "Dashboard Client") : "Autentificare"}
        </Link>

        {/* Meniu pe ecrane mari */}
        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? ( // Afișează aceste link-uri DOAR dacă e autentificat
            <>
              {(userRole === 'admin' || userRole === 'trainer') && ( // Link-uri specifice admin/trainer
                <>
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                    Utilizatori
                  </Link>
                  <Link to="/admin/create-account" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                    Creează Cont
                  </Link>
                </>
              )}
              {/* Link pentru schimbarea parolei - vizibil pentru toți userii autentificați */}
              <Link to="/admin/change-password" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Schimbă Parola
              </Link>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200">
                Deconectare
              </button>
            </>
          ) : (
            // Afișează link-ul de autentificare dacă nu e autentificat
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
              Autentificare
            </Link>
          )}
        </nav>

        {/* Buton meniu "sandviș" pentru ecrane mici */}
        <div className="md:hidden">
          {isAuthenticated ? ( // Butonul hamburger doar dacă e autentificat
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600 focus:outline-none">
              {isMenuOpen ? (
                <FaTimes className="text-2xl" />
              ) : (
                <FaBars className="text-2xl" />
              )}
            </button>
          ) : (
            // Link de autentificare pentru mobil dacă nu e autentificat
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
              Autentificare
            </Link>
          )}
        </div>
      </div>

      {/* Meniu mobil glisant */}
      {isMenuOpen && isAuthenticated && ( // Meniul mobil se deschide DOAR dacă e autentificat
        <div className="md:hidden mt-4 space-y-4 text-center">
          {(userRole === 'admin' || userRole === 'trainer') && (
            <>
              <Link
                to="/admin"
                onClick={handleLinkClick}
                className="block text-gray-800 py-2 border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
              >
                Utilizatori
              </Link>
              <Link
                to="/admin/create-account"
                onClick={handleLinkClick}
                className="block text-gray-800 py-2 border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
              >
                Creează Cont
              </Link>
            </>
          )}
          {/* Link pentru schimbarea parolei în meniul mobil */}
          <Link
            to="/admin/change-password"
            onClick={handleLinkClick}
            className="block text-gray-800 py-2 border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
          >
            Schimbă Parola
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-red-600 py-2 hover:bg-gray-100 transition-colors duration-200"
          >
            Deconectare
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
