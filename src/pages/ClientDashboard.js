import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [simulationResults, setSimulationResults] = useState([]);
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

  const fetchClientData = async () => {
    if (!authUser || !authUser.id) {
      console.warn('Auth user ID not available. Cannot fetch client data.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/users/${authUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(res.data.user);
      setSimulationResults(res.data.simulationResults);
    } catch (err) {
      console.error('Eroare la preluarea datelor clientului:', err);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
        alert('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      } else {
        alert('A apărut o eroare la preluarea datelor tale. Te rugăm să încerci din nou.');
      }
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [authUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-700 text-xl font-semibold p-4">
        Se încarcă datele...
      </div>
    );
  }

  // Helper function to format time in MM:SS
  const formatSecondsToMMSS = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined) {
      return '-';
    }
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 sm:p-6 lg:p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto relative">
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 active:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg z-10"
        >
          Deconectare
        </button>

        <div className="flex justify-between items-center mb-8 pt-16 sm:pt-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 tracking-tight">Bun venit, {user.name}!</h1>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700">Abonamentul meu</h2>
          <p className="text-gray-700 text-lg">
            <strong>Data Expirare Abonament:</strong>{' '}
            <span className="font-semibold text-blue-600">
              {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('ro-RO') : 'N/A'}
            </span>
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700">Prezența mea la Antrenamente</h2>
          {user.attendance && user.attendance.length > 0 ? (
            <ul className="list-disc pl-6 text-gray-700 space-y-2 text-lg">
              {user.attendance
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((att, index) => (
                  <li key={index}>
                    <span className="font-medium">
                      {new Date(att.date).toLocaleDateString('ro-RO')}
                    </span>{' '}
                    - {att.present ? <span className="text-green-600 font-semibold">Prezent</span> : <span className="text-red-600 font-semibold">Absent</span>}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-lg text-center py-4">Nici o prezență înregistrată încă.</p>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700">Rezultatele Simulărilor Mele</h2>
          {simulationResults.length > 0 ? (
            <div className="overflow-x-auto relative shadow-md rounded-lg">
              <table className="min-w-full bg-white text-left text-sm sm:text-base">
                <thead className="bg-blue-50 border-b border-blue-200">
                  <tr>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Data</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Timp Brut</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Penalizări (s)</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Timp Total</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Timp Jaloane</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Obstacole Penalizate</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Obstacole Eliminate</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.map((result) => (
                    <tr key={result._id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6">{new Date(result.date).toLocaleDateString('ro-RO')}</td>
                      <td className="py-3 px-4 sm:px-6 font-mono">{formatSecondsToMMSS(result.rawTime)}</td>
                      <td className="py-3 px-4 sm:px-6">{result.penaltyTime}s</td>
                      <td className="py-3 px-4 sm:px-6 font-mono font-bold text-blue-700">{formatSecondsToMMSS(result.totalTime)}</td>
                      {/* ACEASTĂ LINIE A FOST CORECTATĂ */}
                      <td className="py-3 px-4 sm:px-6 font-mono">{result.javelinTime ? formatSecondsToMMSS(result.javelinTime) : '-'}</td>
                      <td className="py-3 px-4 sm:px-6">{result.penaltiesList?.length > 0 ? result.penaltiesList.join(', ') : '-'}</td>
                      <td className="py-3 px-4 sm:px-6">{result.eliminatedObstaclesList?.length > 0 ? result.eliminatedObstaclesList.join(', ') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-lg text-center py-4">Nici un rezultat al simulării înregistrat încă.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;