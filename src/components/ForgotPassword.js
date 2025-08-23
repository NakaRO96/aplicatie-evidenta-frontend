import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, { phoneNumber });
      setMessage(res.data.message);
      // Redirecționăm utilizatorul după un scurt delay, dacă totul a mers bine
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      console.error('Eroare la cererea de resetare a parolei:', err);
      setMessage(err.response?.data?.message || 'A apărut o eroare. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4 font-sans antialiased">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-blue-100">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-blue-800 mb-6">
          Resetare Parolă
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Introdu numărul tău de telefon pentru a primi instrucțiuni de resetare.
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 block mb-2">
              Număr de telefon
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
              placeholder="Ex: 0712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Se trimite...' : 'Trimite instrucțiuni'}
          </button>
        </form>

        {message && (
          <div className={`mt-6 text-center font-medium ${message.includes('A apărut o eroare') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-600">
          Îți amintești parola?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Autentifică-te
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;