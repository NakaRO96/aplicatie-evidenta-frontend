import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// Am adăugat FaUserCheck pentru iconița noului buton
import { FaUserPlus, FaInfoCircle, FaTrashAlt, FaTrophy, FaRunning, FaUserCheck } from 'react-icons/fa'; 

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [topSimulations, setTopSimulations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const { logout } = useAuth();
  const navigate = useNavigate();

  const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

  const fetchTopSimulations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/simulations/top`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTopSimulations(res.data);
    } catch (err) {
      console.error('Eroare la preluarea topului simulărilor:', err);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/users?filter=${filter}&page=${page}&limit=${itemsPerPage}&searchQuery=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error('Eroare la preluarea utilizatorilor:', err.response ? err.response.data : err.message);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  // NOU: Acest useEffect se va rula o singură dată la montarea componentei
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchUsers(1),
        fetchTopSimulations()
      ]);
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  // NOU: Acest useEffect se va rula de fiecare dată când se schimbă `filter` sau `searchQuery`
  // Nu modifică starea `isLoading`, astfel că ecranul de încărcare nu va mai apărea
  useEffect(() => {
    // Verificăm dacă nu este prima încărcare (când `isLoading` era true)
    if (!isLoading) {
      fetchUsers(1);
    }
  }, [filter, searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Ești sigur că vrei să ștergi utilizatorul ${userName} și toate datele asociate?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${BACKEND_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchUsers(currentPage);
      } catch (err) {
        console.error('Eroare la ștergerea utilizatorului:', err);
        if (err.response && err.response.status === 401) {
          logout();
          navigate('/login');
        }
      }
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      fetchUsers(page);
    }
  };
  
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 tracking-tight text-center sm:text-left">
            Panou Administrator
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/admin/create-account"
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition-all duration-300 shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2"
            >
              <FaUserPlus />
              Creează Cont Nou
            </Link>
            
            {/* INCEPUTUL MODIFICARII: Adăugarea noului buton */}
            <Link
              to="/admin/attendance"
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 active:bg-purple-800 transition-all duration-300 shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2"
            >
              <FaUserCheck />
              Prezență Antrenament
            </Link>
            {/* SFARSITUL MODIFICARII */}
            
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 active:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg text-center"
            >
              Deconectare
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white shadow-xl rounded-2xl p-8 border border-blue-100">
            <FaRunning className="text-blue-500 text-6xl mb-4 animate-bounce" />
            <p className="text-2xl font-bold text-gray-700">Se încarcă datele...</p>
          </div>
        ) : (
          <>
            {topSimulations.length > 0 && (
              <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-blue-100">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700 flex items-center gap-3">
                  <FaTrophy className="text-yellow-500" />
                  Top 3 Cele Mai Bune Timpuri
                </h2>
                <ul className="list-none space-y-4">
                  {topSimulations.map((result, index) => (
                    <li key={result._id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold text-gray-800 w-8 text-center">
                          #{index + 1}
                        </span>
                        <span className="text-lg font-medium text-blue-600">
                          {result.userName}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-gray-900 font-mono">
                        {formatSecondsToMMSS(result.totalTime)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white shadow-lg rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="filter" className="text-gray-700 text-base font-semibold">Filtrează utilizatorii:</label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 bg-white shadow-sm"
                >
                  <option value="all">Toți</option>
                  <option value="active">Activi</option>
                  <option value="expired">Expirați</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Căută după nume sau telefon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 flex-grow w-full sm:w-auto transition-all duration-200 shadow-sm"
              />
            </div>

            <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-blue-100">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700">Lista Utilizatorilor</h2>
              {users.length === 0 ? (
                <p className="text-gray-600 text-lg text-center py-4">Nu există utilizatori înregistrați conform filtrului și căutării selectate.</p>
              ) : (
                <>
                  <div className="overflow-x-auto relative shadow-md rounded-lg">
                    <table className="min-w-full bg-white text-left table-auto">
                      <thead className="bg-blue-50 border-b border-blue-200">
                        <tr>
                          <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700 whitespace-nowrap">Nume</th>
                          <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700 whitespace-nowrap">Număr Telefon</th>
                          <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700 whitespace-nowrap">Abonament Expiră</th>
                          <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700 whitespace-nowrap">Rol</th>
                          <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700 whitespace-nowrap">Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150">
                            <td className="py-4 px-4 sm:px-6 font-semibold text-gray-900 whitespace-nowrap">{user.name}</td>
                            <td className="py-4 px-4 sm:px-6 whitespace-nowrap">{user.phoneNumber}</td>
                            <td className="py-4 px-4 sm:px-6 whitespace-nowrap">{user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('ro-RO') : 'N/A'}</td>
                            <td className="py-4 px-4 sm:px-6 whitespace-nowrap">{user.role}</td>
                            <td className="py-4 px-4 sm:px-6 flex flex-col sm:flex-row gap-2">
                              <Link
                                to={`/admin/users/${user._id}`}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-center flex items-center justify-center gap-1 w-full sm:w-auto"
                              >
                                <FaInfoCircle />
                                Detalii
                              </Link>
                              <button
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-600 active:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md text-center flex items-center justify-center gap-1 w-full sm:w-auto"
                              >
                                <FaTrashAlt />
                                Șterge
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-center items-center mt-4 space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors duration-200"
                    >
                      &laquo; Precedenta
                    </button>
                    <span className="text-lg font-semibold text-gray-800">
                      Pagina {currentPage} din {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors duration-200"
                    >
                      Urmatoarea &raquo;
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;