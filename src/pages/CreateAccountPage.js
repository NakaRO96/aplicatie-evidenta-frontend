import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function CreateAccountPage() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validare simplă
    if (!name || !phoneNumber || !password) {
      setError('Te rog să completezi toate câmpurile.');
      return;
    }

    try {
      // AICI S-A FĂCUT MODIFICAREA. Se folosește adresa backend-ului de pe Render și ruta corectă.
      const res = await axios.post('https://aplicatie-evidenta-backend.onrender.com/api/users', {
        name,
        phoneNumber,
        password,
        role
      });
      setMessage(res.data.msg);
      alert('Contul a fost creat cu succes!');
      // Curăță formularul
      setName('');
      setPhoneNumber('');
      setPassword('');
      setRole('client');
      navigate('/admin'); // Redirecționează înapoi la lista de utilizatori
    } catch (err) {
      console.error('Eroare la crearea contului:', err.response ? err.response.data : err.message);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
        alert('Sesiunea a expirat. Te rugăm să te autentifici din nou ca admin.');
      } else if (err.response && err.response.status === 400 && err.response.data.msg) {
        setError(err.response.data.msg); // Mesaj specific de la backend (ex: "Numărul de telefon este deja înregistrat.")
      } else {
        setError('A apărut o eroare la crearea contului.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4 sm:p-6 font-sans antialiased">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-lg border border-blue-100">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 text-blue-800 tracking-tight">Creează Cont Nou</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-base font-semibold mb-2">
              Nume Prenume:
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 shadow-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 text-base font-semibold mb-2">
              Număr de telefon:
            </label>
            <input
              type="text"
              id="phoneNumber"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 shadow-sm"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-base font-semibold mb-2">
              Parola inițială:
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-gray-700 text-base font-semibold mb-2">
              Rol:
            </label>
            <select
              id="role"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 bg-white shadow-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="client">Client</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          {error && <p className="text-red-600 text-sm font-medium mt-4 text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm font-medium mt-4 text-center">{message}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline w-full transition-all duration-300 shadow-md hover:shadow-lg mt-6"
          >
            Creează Cont
          </button>
        </form>
        <div className="mt-8 text-center">
          <Link
            to="/admin"
            className="inline-flex items-center text-blue-700 hover:text-blue-900 font-semibold transition-colors duration-200 text-base group"
          >
            <svg
              className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Înapoi la Panoul Administrator
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CreateAccountPage;