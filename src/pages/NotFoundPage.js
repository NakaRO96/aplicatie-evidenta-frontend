import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 text-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-12 border border-blue-100">
        <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-2">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4">
          Pagina nu a fost găsită
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Ne pare rău, dar pagina pe care o cauți nu există sau a fost mutată.
        </p>
        <Link 
          to="/login" // Redirecționează direct la pagina de login pentru simplitate
          className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg"
        >
          Înapoi la pagina de autentificare
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;