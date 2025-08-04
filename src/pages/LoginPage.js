import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPhone, FaLock, FaSignInAlt, FaQuestionCircle, FaEye, FaEyeSlash } from 'react-icons/fa'; // NOU: Importă FaEye, FaEyeSlash

function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // NOU: Stare pentru vizibilitatea parolei
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
          <div className="relative">
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
              Număr de telefon:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FaPhone />
              </span>
              <input
                type="tel" // MODIFICAT: Tip "tel" pentru tastatura numerică pe mobil
                id="phoneNumber"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Parola:
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FaLock />
              </span>
              <input
                type={showPassword ? 'text' : 'password'} // NOU: Tip dinamic pentru vizibilitatea parolei
                id="password"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 pl-10 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500" // MODIFICAT: Adăugat `pr-10` pentru butonul ochi
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // NOU: Toggle vizibilitate
                className="absolute inset-y-0 right-0 top-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors duration-200 focus:outline-none h-full" // Ajustat h-full
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />} {/* NOU: Iconița ochi */}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200 flex items-center justify-center gap-2"
          >
            <FaSignInAlt />
            Intră în cont
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-blue-600 hover:underline font-medium flex items-center justify-center gap-1">
            <FaQuestionCircle />
            Ai uitat parola?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;