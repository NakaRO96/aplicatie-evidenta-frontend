import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Obține funcția de login din context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Curăță erorile anterioare

    if (!phoneNumber || !password) {
      setError('Te rog să introduci numărul de telefon și parola.');
      return;
    }

    const result = await login(phoneNumber, password); // Apelează funcția de login din context
    if (result.success) {
      // Redirecționează în funcție de rol
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    } else {
      setError(result.error || 'Autentificare eșuată. Verifică credențialele.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Autentificare</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
              Număr de telefon:
            </label>
            <input
              type="text"
              id="phoneNumber"
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Parola:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200"
          >
            Intră în cont
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;