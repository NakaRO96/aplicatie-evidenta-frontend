import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/users?filter=${filter}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Eroare la preluarea utilizatorilor:', err.response ? err.response.data : err.message);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
        alert('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      } else if (err.response && err.response.status === 403) {
        alert('Acces neautorizat la resursă.');
      } else {
        alert('A apărut o eroare la preluarea utilizatorilor.');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

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
        alert(`Utilizatorul ${userName} a fost șters cu succes.`);
        fetchUsers();
      } catch (err) {
        console.error('Eroare la ștergerea utilizatorului:', err);
        if (err.response && err.response.status === 401) {
          logout();
          navigate('/login');
          alert('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
        } else if (err.response && err.response.status === 403) {
          alert('Acces neautorizat. Nu ai permisiunea de a șterge utilizatori.');
        } else {
          alert('A apărut o eroare la ștergerea utilizatorului.');
        }
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phoneNumber.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 sm:p-6 lg:p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        {/* Header Dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 tracking-tight text-center sm:text-left">
            Panou Administrator
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/admin/create-account"
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition-all duration-300 shadow-md hover:shadow-lg text-center"
            >
              Creează Cont Nou
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 active:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg text-center"
            >
              Deconectare
            </button>
          </div>
        </div>

        {/* Filtre și Căutare */}
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

        {/* Lista Utilizatorilor */}
        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-blue-100">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700">Lista Utilizatorilor</h2>
          {filteredUsers.length === 0 ? (
            <p className="text-gray-600 text-lg text-center py-4">Nu există utilizatori înregistrați conform filtrului și căutării selectate.</p>
          ) : (
            <div className="overflow-x-auto relative shadow-md rounded-lg">
              <table className="min-w-full bg-white text-left">
                <thead className="bg-blue-50 border-b border-blue-200 hidden md:table-header-group">
                  <tr>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Nume</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Număr Telefon</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Abonament Expiră</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Rol</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="block md:table-row-group">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-200 md:table-row md:hover:bg-blue-50 transition-colors duration-150 block md:p-4 md:rounded-xl md:shadow-md md:bg-white md:mb-0 mb-4 p-4 rounded-xl shadow-md bg-white">
                      <td data-label="Nume" className="py-2 px-0 block md:table-cell md:py-3 md:px-6 font-semibold text-gray-700 md:text-gray-900">
                        <span className="md:hidden text-gray-500 font-normal block">Nume:</span>
                        {user.name}
                      </td>
                      <td data-label="Număr Telefon" className="py-2 px-0 block md:table-cell md:py-3 md:px-6">
                        <span className="md:hidden text-gray-500 font-normal block">Număr Telefon:</span>
                        {user.phoneNumber}
                      </td>
                      <td data-label="Abonament Expiră" className="py-2 px-0 block md:table-cell md:py-3 md:px-6">
                        <span className="md:hidden text-gray-500 font-normal block">Abonament Expiră:</span>
                        {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('ro-RO') : 'N/A'}
                      </td>
                      <td data-label="Rol" className="py-2 px-0 block md:table-cell md:py-3 md:px-6">
                        <span className="md:hidden text-gray-500 font-normal block">Rol:</span>
                        {user.role}
                      </td>
                      <td data-label="Acțiuni" className="py-2 px-0 flex flex-col sm:flex-row gap-2 md:table-cell md:py-3 md:px-6">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-center"
                        >
                          Detalii
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-600 active:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md text-center"
                        >
                          Șterge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;