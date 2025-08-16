import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaRunning } from 'react-icons/fa'; // NOU: Importă iconițele FaEye, FaEyeSlash și FaRunning

function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false); // NOU: Stare pentru vizibilitatea parolei curente
  const [showNewPassword, setShowNewPassword] = useState(false);     // NOU: Stare pentru vizibilitatea parolei noi
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // NOU: Stare de încărcare pentru formular
  const navigate = useNavigate();

  const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Începe încărcarea

    if (newPassword !== confirmNewPassword) {
      setError('Noile parole nu se potrivesc.');
      setIsLoading(false); // Oprește încărcarea
      return;
    }

    if (newPassword.length < 6) {
      setError('Parola nouă trebuie să aibă minim 6 caractere.');
      setIsLoading(false); // Oprește încărcarea
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BACKEND_URL}/api/users/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Parola a fost schimbată cu succes!');
      navigate('/admin'); // Navighează înapoi la panoul de administrare (sau la dashboard-ul clientului)
    } catch (err) {
      console.error('Eroare la schimbarea parolei (frontend):', err.response?.data?.msg || err.message);
      const errorMessage = err.response?.data?.msg || 'A apărut o eroare la schimbarea parolei.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false); // Oprește încărcarea indiferent de rezultat
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Schimbă Parola</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="currentPassword">
              Parola Curentă
            </label>
            <input
              type={showCurrentPassword ? 'text' : 'password'} // NOU: Tip dinamic
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-10" // Adăugat pr-10
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 top-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors duration-200 focus:outline-none h-full"
            >
              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="newPassword">
              Parola Nouă
            </label>
            <input
              type={showNewPassword ? 'text' : 'password'} // NOU: Tip dinamic
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-10" // Adăugat pr-10
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 top-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors duration-200 focus:outline-none h-full"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="confirmNewPassword">
              Confirmă Parola Nouă
            </label>
            <input
              type={showNewPassword ? 'text' : 'password'} // Folosim aceeași vizibilitate ca pentru parola nouă
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-10" // Adăugat pr-10
              required
            />
            {/* Ochiul poate fi omis aici sau duplicat dacă vrei control independent */}
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 top-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors duration-200 focus:outline-none h-full"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            disabled={isLoading} // Dezactivează butonul în timpul încărcării
          >
            {isLoading ? (
              <>
                <FaRunning className="animate-spin" />
                Se procesează...
              </>
            ) : (
              'Schimbă Parola'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
