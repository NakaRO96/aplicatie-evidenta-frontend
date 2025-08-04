import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Parolele nu se potrivesc.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      // Redirecționează utilizatorul la login după un scurt delay
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      console.error('Eroare la resetarea parolei:', err);
      setMessage(err.response?.data?.message || 'Token invalid sau expirat. Te rog să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4 font-sans antialiased">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-blue-100">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-blue-800 mb-6">
          Setează o parolă nouă
        </h2>
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 block mb-2">
              Parolă nouă
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
              placeholder="Introdu o parolă nouă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 block mb-2">
              Confirmă parola
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
              placeholder="Confirmă parola nouă"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Se resetează...' : 'Resetează Parola'}
          </button>
        </form>

        {message && (
          <div className={`mt-6 text-center font-medium ${message.includes('invalid') || message.includes('expirat') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;