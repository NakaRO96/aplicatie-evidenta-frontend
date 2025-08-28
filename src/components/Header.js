import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, userRole, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <span className="text-2xl font-bold text-blue-700">
          Evidenta
        </span>

        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              {userRole === 'admin' && (
                <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                  Utilizatori
                </Link>
              )}
              {/* Ruta corectă pentru Schimbă Parola este specifică pentru admin */}
              <Link to="/admin/change-password" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Schimbă Parola
              </Link>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200">
                Deconectare
              </button>
            </>
          ) : (
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
              Autentificare
            </Link>
          )}
        </nav>

        <div className="md:hidden">
          {isAuthenticated ? (
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600 focus:outline-none">
              {isMenuOpen ? (
                <FaTimes className="text-2xl" />
              ) : (
                <FaBars className="text-2xl" />
              )}
            </button>
          ) : (
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
              Autentificare
            </Link>
          )}
        </div>

        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg py-2 transition-all duration-300 transform translate-y-0">
            {userRole === 'admin' && (
              <Link
                to="/admin"
                onClick={handleLinkClick}
                className="block text-gray-800 py-2 border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 text-center"
              >
                Utilizatori
              </Link>
            )}
            <Link
              to="/admin/change-password"
              onClick={handleLinkClick}
              className="block text-gray-800 py-2 border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200 text-center"
            >
              Schimbă Parola
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-red-600 py-2 hover:bg-gray-100 transition-colors duration-200 text-center"
            >
              Deconectare
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;