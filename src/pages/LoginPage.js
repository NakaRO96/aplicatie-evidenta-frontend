import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPhone, FaLock, FaSignInAlt, FaQuestionCircle } from 'react-icons/fa'; // NOU: Importă iconițele necesare

function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber || !password) {
      toast.error('Te rog să introduci numărul de telefon și parola.');
      return;
    }

    const result = await login(phoneNumber, password);
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
      toast.success('Autentificare reușită!');
    } else {
      toast.error(result.error || 'Autentificare eșuată. Verifică credențialele.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Autentificare</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative"> {/* MODIFICAT: Adăugat `relative` */}
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
              Număr de telefon:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FaPhone /> {/* NOU: Iconița pentru numărul de telefon */}
              </span>
              <input
                type="text"
                id="phoneNumber"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500" // MODIFICAT: Adăugat `pl-10` pentru spațiu
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="relative"> {/* MODIFICAT: Adăugat `relative` */}
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Parola:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FaLock /> {/* NOU: Iconița pentru parolă */}
              </span>
              <input
                type="password"
                id="password"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500" // MODIFICAT: Adăugat `pl-10` pentru spațiu
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200 flex items-center justify-center gap-2" // MODIFICAT: Adăugat `flex items-center justify-center gap-2`
          >
            <FaSignInAlt /> {/* NOU: Iconița pentru butonul de login */}
            Intră în cont
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-blue-600 hover:underline font-medium flex items-center justify-center gap-1"> {/* MODIFICAT: Adăugat `flex items-center justify-center gap-1` */}
            <FaQuestionCircle /> {/* NOU: Iconița pentru link-ul de parolă uitată */}
            Ai uitat parola?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;