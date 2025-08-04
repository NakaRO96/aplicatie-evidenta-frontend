import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify'; // NOU: Importă funcția toast
import { FaUser, FaPhone, FaLock, FaUserPlus, FaArrowLeft } from 'react-icons/fa'; // NOU: Importă iconițele necesare

function CreateAccountPage() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  // Eliminat: const [message, setMessage] = useState('');
  // Eliminat: const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Eliminat: setMessage('');
    // Eliminat: setError('');

    if (!name || !phoneNumber || !password) {
      toast.error('Te rog să completezi toate câmpurile.'); // MODIFICAT
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BACKEND_URL}/api/users`, {
        name,
        phoneNumber,
        password,
        role
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(res.data.msg || 'Contul a fost creat cu succes!'); // MODIFICAT
      setName('');
      setPhoneNumber('');
      setPassword('');
      setRole('client');
      navigate('/admin');
    } catch (err) {
      console.error('Eroare la crearea contului:', err.response ? err.response.data : err.message);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou ca admin.'); // MODIFICAT
      } else if (err.response && err.response.status === 400 && err.response.data.msg) {
        toast.error(err.response.data.msg); // MODIFICAT
      } else {
        toast.error('A apărut o eroare la crearea contului.'); // MODIFICAT
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4 sm:p-6 font-sans antialiased">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-lg border border-blue-100">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 text-blue-800 tracking-tight">Creează Cont Nou</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative"> {/* NOU: Adăugat relative */}
            <label htmlFor="name" className="block text-gray-700 text-base font-semibold mb-1">
              Nume Prenume:
            </label>
            <div className="relative"> {/* NOU: Adăugat relative pentru iconiță */}
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FaUser /> {/* NOU: Iconiță */}
              </span>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 shadow-sm" // MODIFICAT: Adăugat pl-10
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="relative"> {/* NOU: Adăugat relative */}
            <label htmlFor="phoneNumber" className="block text-gray-700 text-base font-semibold mb-1">
              Număr de telefon:
            </label>
            <div className="relative"> {/* NOU: Adăugat relative pentru iconiță */}
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FaPhone /> {/* NOU: Iconiță */}
              </span>
              <input
                type="text"
                id="phoneNumber"
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 shadow-sm" // MODIFICAT: Adăugat pl-10
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="relative"> {/* NOU: Adăugat relative */}
            <label htmlFor="password" className="block text-gray-700 text-base font-semibold mb-1">
              Parola inițială:
            </label>
            <div className="relative"> {/* NOU: Adăugat relative pentru iconiță */}
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FaLock /> {/* NOU: Iconiță */}
              </span>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 shadow-sm" // MODIFICAT: Adăugat pl-10
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="role" className="block text-gray-700 text-base font-semibold mb-1">
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
          {/* Eliminat: {error && <p className="text-red-600 text-sm font-medium mt-4 text-center">{error}</p>} */}
          {/* Eliminat: {message && <p className="text-green-600 text-sm font-medium mt-4 text-center">{message}</p>} */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline w-full transition-all duration-300 shadow-md hover:shadow-lg mt-5 flex items-center justify-center gap-2" // MODIFICAT: Adăugat flex, items-center, justify-center, gap-2
          >
            <FaUserPlus /> {/* NOU: Iconiță */}
            Creează Cont
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            to="/admin"
            className="inline-flex items-center text-blue-700 hover:text-blue-900 font-semibold transition-colors duration-200 text-base group gap-2" // MODIFICAT: Adăugat gap-2
          >
            <FaArrowLeft className="transform group-hover:-translate-x-1 transition-transform duration-200" /> {/* NOU: Iconiță */}
            Înapoi la Panoul Administrator
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CreateAccountPage;