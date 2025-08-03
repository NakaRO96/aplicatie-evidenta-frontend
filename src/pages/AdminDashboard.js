import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired'
  const { logout } = useAuth(); // Obține funcția de logout din context
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      // Trimite token-ul de autentificare în header-ul cererii
      const res = await axios.get(`https://aplicatie-evidenta-backend.onrender.com`);
      setUsers(res.data);
    } catch (err) {
      console.error('Eroare la preluarea utilizatorilor:', err);
      // GESTIONARE EROARE: ex. token expirat (401 Unauthorized), redirecționare la login
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
        alert('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      } else if (err.response && err.response.status === 403) {
        alert('Acces neautorizat la resursă.');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]); // Reîncarcă utilizatorii la schimbarea filtrului

  const handleLogout = () => {
    logout(); // Apeleză funcția de logout din context
    navigate('/login'); // Redirecționează la pagina de login
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Ești sigur că vrei să ștergi utilizatorul ${userName} și toate datele asociate?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`);
        alert(`Utilizatorul ${userName} a fost șters cu succes.`);
        fetchUsers(); // Reîncarcă lista de utilizatori
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Panou Administrator</h1>
        <div>
          <Link to="/admin/create-account" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2">
            Creează Cont Nou
          </Link>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Deconectare
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="filter" className="mr-2 text-gray-700">Filtrează utilizatorii:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toți</option>
          <option value="active">Activi</option>
          <option value="expired">Expirați</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Lista Utilizatorilor</h2>
        {users.length === 0 ? (
          <p className="text-gray-600">Nu există utilizatori înregistrați conform filtrului selectat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-blue-100 text-left text-gray-800">
                  <th className="py-2 px-4 border-b border-gray-300">Nume</th>
                  <th className="py-2 px-4 border-b border-gray-300">Număr Telefon</th>
                  <th className="py-2 px-4 border-b border-gray-300">Abonament Expiră</th>
                  <th className="py-2 px-4 border-b border-gray-300">Rol</th>
                  <th className="py-2 px-4 border-b border-gray-300">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                    <td className="py-2 px-4">{user.name}</td>
                    <td className="py-2 px-4">{user.phoneNumber}</td>
                    <td className="py-2 px-4">
                      {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('ro-RO') : 'N/A'}
                    </td>
                    <td className="py-2 px-4">{user.role}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition duration-200"
                      >
                        Detalii
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition duration-200"
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
  );
}

export default AdminDashboard;