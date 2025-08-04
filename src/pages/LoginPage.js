import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa'; // NOU: FaLock, FaEye, FaEyeSlash

function LoginPage() {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false); // NOU: Stare pentru vizibilitatea parolei
  const { login } = useAuth();
  const navigate = useNavigate();

  const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/users/login`, formData);
      login(res.data.token, res.data.user);
      toast.success('Autentificare reușită!');

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    } catch (err) {
      console.error('Eroare de autentificare:', err.response.data);
      toast.error(err.response?.data?.msg || 'Eroare la autentificare. Verifică datele.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4 font-sans antialiased">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center text-blue-800 mb-6 tracking-tight">
          Autentificare
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="emailOrPhone">
              Email sau Telefon
            </label>
            <span className="absolute inset-y-0 left-0 top-7 pl-3 flex items-center text-gray-400">
              <FaUser />
            </span>
            <input
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200"
              placeholder="Adresă de email sau număr de telefon"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Parolă
            </label>
            <span className="absolute inset-y-0 left-0 top-7 pl-3 flex items-center text-gray-400">
              <FaLock /> {/* NOU: Iconița de lacăt */}
            </span>
            <input
              type={showPassword ? 'text' : 'password'} // NOU: Tip dinamic
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200"
              placeholder="Parolă"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // NOU: Toggle vizibilitate
              className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors duration-200 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />} {/* NOU: Iconița ochi */}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Autentificare
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600 text-sm">
          Nu ai un cont?{' '}
          <Link to="/create-account" className="text-blue-600 font-semibold hover:underline">
            Creează un cont nou
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;