import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CourseTimer from '../components/CourseTimer';
import { toast } from 'react-toastify';
import { FaRunning, FaArrowLeft, FaTrashAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

function UserDetailsPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [simulationResults, setSimulationResults] = useState([]);
  const [showTimer, setShowTimer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Se încarcă detaliile utilizatorului...");

  // Stări noi pentru editarea simulărilor
  const [editingSimulationId, setEditingSimulationId] = useState(null);
  const [editedSimulation, setEditedSimulation] = useState({});

  const { logout } = useAuth();
  const navigate = useNavigate();

  const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/users/${id}`);
      setUser(res.data.user);
      setSimulationResults(res.data.simulationResults);
      setEditedUser(res.data.user);
    } catch (err) {
      console.error('Eroare la preluarea detaliilor utilizatorului:', err);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      } else if (err.response && err.response.status === 403) {
        toast.error('Acces neautorizat la resursă.');
      } else if (err.response && err.response.status === 404) {
        toast.error('Utilizatorul nu a fost găsit.');
        setUser(null);
      } else {
        toast.error('A apărut o eroare la preluarea detaliilor utilizatorului.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setLoadingMessage("Se încarcă detaliile utilizatorului...");

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setLoadingMessage("Eroare de rețea. Te rugăm să reîmprospătești pagina.");
      }
    }, 15000);

    fetchUserDetails();

    return () => clearTimeout(timeoutId);
  }, [id, showTimer]);

  const handleUpdateUser = async () => {
    if (!editedUser.name || !editedUser.phoneNumber) {
      toast.error('Numele și numărul de telefon nu pot fi goale.');
      return;
    }

    try {
      await axios.put(`${BACKEND_URL}/api/users/${id}`, {
        name: editedUser.name,
        phoneNumber: editedUser.phoneNumber,
        subscriptionEndDate: editedUser.subscriptionEndDate,
      });
      toast.success('Detalii utilizator actualizate cu succes!');
      setEditMode(false);
      fetchUserDetails();
    } catch (err) {
      console.error('Eroare la actualizarea utilizatorului:', err);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      } else if (err.response && err.response.status === 400 && err.response.data.msg) {
        toast.error(`Eroare: ${err.response.data.msg}`);
      }
      else {
        toast.error('Eroare la actualizarea detaliilor utilizatorului.');
      }
    }
  };

  const handleAddAttendance = async () => {
    if (!attendanceDate) {
      setAttendanceError('Te rog să selectezi o dată.');
      return;
    }
    setAttendanceError('');

    try {
      // Endpointul de backend trebuie să existe pentru această acțiune
      await axios.post(`${BACKEND_URL}/api/users/${id}/attendance`, { date: attendanceDate });
      toast.success('Prezență adăugată cu succes!');
      setAttendanceDate('');
      fetchUserDetails();
    } catch (err) {
      console.error('Eroare la adăugarea prezenței:', err);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      } else {
        toast.error('A apărut o eroare la adăugarea prezenței.');
      }
    }
  };
  
  const handleDeleteAttendance = async (dateToDelete) => {
    if (window.confirm('Ești sigur că vrei să ștergi această prezență?')) {
      try {
        const updatedAttendance = user.attendance.filter(att => new Date(att.date).toISOString() !== dateToDelete.toISOString());
        // Atenție: Această metodă funcționează doar dacă backend-ul permite update-ul complet al listei
        await axios.put(`${BACKEND_URL}/api/users/${id}`, { attendance: updatedAttendance });
        toast.success('Prezență ștearsă cu succes!');
        fetchUserDetails();
      } catch (err) {
        console.error('Eroare la ștergerea prezenței:', err);
        toast.error('A apărut o eroare la ștergerea prezenței.');
      }
    }
  };

  const handleDeleteSimulation = async (simId) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest rezultat al simulării? Această acțiune este ireversibilă.')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/simulations/${simId}`);
        toast.success('Rezultat șters cu succes!');
        fetchUserDetails();
      } catch (err) {
        console.error('Eroare la ștergerea rezultatului simulării:', err);
        if (err.response && err.response.status === 401) {
          logout();
          navigate('/login');
          toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
        } else if (err.response && err.response.status === 403) {
          toast.error('Acces neautorizat. Nu ai permisiunea de a șterge rezultate.');
        } else {
          toast.error('A apărut o eroare la ștergerea rezultatului simulării.');
        }
      }
    }
  };

  const handleEditSimulation = (result) => {
    setEditingSimulationId(result._id);
    setEditedSimulation({
      ...result,
      penaltiesList: result.penaltiesList.join(', '),
      eliminatedObstaclesList: result.eliminatedObstaclesList.join(', ')
    });
  };

  const handleUpdateSimulation = async () => {
    try {
      // Backend-ul trebuie să aibă un endpoint PUT /api/simulations/:id
      await axios.put(`${BACKEND_URL}/api/simulations/${editingSimulationId}`, {
        ...editedSimulation,
        penaltiesList: editedSimulation.penaltiesList.split(',').map(s => s.trim()).filter(s => s),
        eliminatedObstaclesList: editedSimulation.eliminatedObstaclesList.split(',').map(s => s.trim()).filter(s => s)
      });
      toast.success('Simulare actualizată cu succes!');
      setEditingSimulationId(null);
      fetchUserDetails();
    } catch (err) {
      console.error('Eroare la actualizarea simulării:', err);
      toast.error('A apărut o eroare la actualizarea simulării. Verifică backend-ul.');
    }
  };

  const handleCancelEditSimulation = () => {
    setEditingSimulationId(null);
    setEditedSimulation({});
  };

  const formatSecondsToMMSS = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
      return '-';
    }
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 text-xl font-semibold text-blue-800">
        <FaRunning className="text-blue-500 text-6xl mb-4 animate-bounce" />
        <p className="text-2xl font-bold text-gray-700">{loadingMessage}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 text-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-12 border border-blue-100">
          <FaArrowLeft className="text-red-500 text-6xl mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-2">Eroare</h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4">Utilizatorul nu a fost găsit.</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Este posibil ca ID-ul utilizatorului să fie incorect sau datele să nu poată fi încărcate.
          </p>
          <Link
            to="/admin"
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg"
          >
            Înapoi la Panoul Administrator
          </Link>
        </div>
      </div>
    );
  }

  if (showTimer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 sm:p-6 lg:p-8 font-sans antialiased flex items-center justify-center">
        <CourseTimer
          userId={user._id}
          onSimulationSaved={() => {
            setShowTimer(false);
            fetchUserDetails();
          }}
          onCancel={() => setShowTimer(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 sm:p-6 lg:p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center text-blue-700 hover:text-blue-900 font-semibold mb-6 transition-colors duration-200 text-lg group"
        >
          <FaArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          Înapoi la Panoul Administrator
        </Link>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 mb-10 text-center tracking-tight">
          Detalii Utilizator: <span className="text-indigo-600">{user.name}</span>
        </h1>

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-blue-100">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-700">Informații Utilizator</h2>
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-base font-semibold mb-2">Nume:</label>
                <input
                  type="text"
                  className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200"
                  value={editedUser.name || ''}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-base font-semibold mb-2">Număr Telefon:</label>
                <input
                  type="text"
                  className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200"
                  value={editedUser.phoneNumber || ''}
                  onChange={(e) => setEditedUser({ ...editedUser, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-base font-semibold mb-2">Data Expirare Abonament:</label>
                <input
                  type="date"
                  className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200"
                  value={editedUser.subscriptionEndDate ? new Date(editedUser.subscriptionEndDate).toISOString().substring(0, 10) : ''}
                  onChange={(e) => setEditedUser({ ...editedUser, subscriptionEndDate: e.target.value })}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleUpdateUser}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Salvează Modificări
                </button>
                <button
                  onClick={() => { setEditMode(false); setEditedUser(user); }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 active:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Anulează
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-gray-800 text-lg">
              <p><strong>Nume:</strong> {user.name}</p>
              <p><strong>Număr telefon:</strong> {user.phoneNumber}</p>
              <p><strong>Rol:</strong> {user.role}</p>
              <p>
                <strong>Abonament Expiră:</strong>{' '}
                {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString('ro-RO') : 'N/A'}
              </p>
              <button
                onClick={() => setEditMode(true)}
                className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-600 active:bg-yellow-700 transition-all duration-300 mt-6 shadow-md hover:shadow-lg"
              >
                Editează Detalii
              </button>
            </div>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-purple-100">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-700">Prezență la Antrenamente</h2>
          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <label htmlFor="attendanceDate" className="block text-gray-700 text-base font-semibold flex-shrink-0">
              Adaugă Prezență pentru data:
            </label>
            <input
              type="date"
              id="attendanceDate"
              className="border border-gray-300 px-4 py-2 rounded-lg w-full sm:w-auto focus:outline-none focus:ring-3 focus:ring-purple-400 transition-all duration-200"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
            <button
              onClick={handleAddAttendance}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 active:bg-purple-800 transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              Adaugă Prezență
            </button>
          </div>
          {attendanceError && <p className="text-red-500 text-sm italic mb-4">{attendanceError}</p>}
          {user.attendance && user.attendance.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
              <ul className="list-disc pl-5 text-gray-800 space-y-2">
                {user.attendance
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((att, index) => (
                    <li key={index} className="flex items-center justify-between text-base">
                      <div>
                        <span className="font-medium">{new Date(att.date).toLocaleDateString('ro-RO')}</span> -{' '}
                        <span className={`${att.present ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                          {att.present ? 'Prezent' : 'Absent'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteAttendance(new Date(att.date))}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <FaTrashAlt />
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-600 text-base">Nici o prezență înregistrată încă.</p>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-emerald-100 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-emerald-700">Adaugă Simulare Traseu Aplicativ</h2>
          {!showTimer ? (
            <button
              onClick={() => setShowTimer(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Start Simularea Traseului
            </button>
          ) : null}
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-teal-100">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-teal-700">Rezultate Simulări</h2>
          {simulationResults.length > 0 ? (
            <div className="overflow-x-auto relative shadow-md rounded-lg">
              <table className="min-w-full bg-white text-left text-sm sm:text-base">
                <thead className="bg-teal-50 border-b border-teal-200">
                  <tr>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Data</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Timp Brut</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Penalizări (s)</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Timp Total</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Timp Jaloane</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Obstacole Penalizate</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Obstacole Eliminate</th>
                    <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-gray-700">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.map((result) => (
                    <tr key={result._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6">{new Date(result.date).toLocaleDateString('ro-RO')}</td>
                      {editingSimulationId === result._id ? (
                        <>
                          <td className="py-3 px-4 sm:px-6">
                            <input
                              type="number"
                              className="w-20 border rounded px-1"
                              value={editedSimulation.rawTime}
                              onChange={(e) => setEditedSimulation({ ...editedSimulation, rawTime: parseFloat(e.target.value) })}
                            />
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <input
                              type="number"
                              className="w-20 border rounded px-1"
                              value={editedSimulation.penaltyTime}
                              onChange={(e) => setEditedSimulation({ ...editedSimulation, penaltyTime: parseFloat(e.target.value) })}
                            />
                          </td>
                          <td className="py-3 px-4 sm:px-6 font-mono font-bold text-teal-700">
                            {formatSecondsToMMSS(editedSimulation.rawTime + editedSimulation.penaltyTime)}
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <input
                              type="number"
                              className="w-20 border rounded px-1"
                              value={editedSimulation.javelinTime}
                              onChange={(e) => setEditedSimulation({ ...editedSimulation, javelinTime: parseFloat(e.target.value) })}
                            />
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <input
                              type="text"
                              className="w-full border rounded px-1"
                              value={editedSimulation.penaltiesList}
                              onChange={(e) => setEditedSimulation({ ...editedSimulation, penaltiesList: e.target.value })}
                            />
                          </td>
                          <td className="py-3 px-4 sm:px-6">
                            <input
                              type="text"
                              className="w-full border rounded px-1"
                              value={editedSimulation.eliminatedObstaclesList}
                              onChange={(e) => setEditedSimulation({ ...editedSimulation, eliminatedObstaclesList: e.target.value })}
                            />
                          </td>
                          <td className="py-3 px-4 sm:px-6 flex gap-2">
                            <button onClick={handleUpdateSimulation} className="text-green-600 hover:text-green-800"><FaSave /></button>
                            <button onClick={handleCancelEditSimulation} className="text-gray-500 hover:text-gray-700"><FaTimes /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 sm:px-6 font-mono">{formatSecondsToMMSS(result.rawTime)}</td>
                          <td className="py-3 px-4 sm:px-6">{result.penaltyTime}s</td>
                          <td className="py-3 px-4 sm:px-6 font-mono font-bold text-teal-700">{formatSecondsToMMSS(result.totalTime)}</td>
                          <td className="py-3 px-4 sm:px-6 font-mono">{result.javelinTime ? formatSecondsToMMSS(result.javelinTime) : '-'}</td>
                          <td className="py-3 px-4 sm:px-6 text-gray-600">
                            {result.penaltiesList?.length > 0 ? result.penaltiesList.join(', ') : '-'}
                          </td>
                          <td className="py-3 px-4 sm:px-6 text-gray-600">
                            {result.eliminatedObstaclesList?.length > 0 ? result.eliminatedObstaclesList.join(', ') : '-'}
                          </td>
                          <td className="py-3 px-4 sm:px-6 flex gap-2">
                            <button
                              onClick={() => handleEditSimulation(result)}
                              className="bg-yellow-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-yellow-600 transition-all duration-200 shadow-sm"
                            >
                              Editează
                            </button>
                            <button
                              onClick={() => handleDeleteSimulation(result._id)}
                              className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-red-600 transition-all duration-200 shadow-sm"
                            >
                              Șterge
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-base">Nici un rezultat al simulării înregistrat încă pentru acest utilizator.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetailsPage;