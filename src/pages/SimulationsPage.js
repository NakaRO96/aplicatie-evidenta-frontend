import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../config/config.js'; // Aici am adăugat .js

const SimulationsPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timerState, setTimerState] = useState({}); // { candidateId: { isRunning: false, time: 0, interval: null } }

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Nu ești autentificat.');
        return;
      }

      const res = await axios.get(`${BACKEND_URL}/api/users/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Eroare la preluarea candidaților.');
      setLoading(false);
    }
  };

  const handleStartStopTimer = (candidateId) => {
    setTimerState(prevState => {
      const currentTimer = prevState[candidateId] || { isRunning: false, time: 0, interval: null };

      if (currentTimer.isRunning) {
        // Stop the timer
        clearInterval(currentTimer.interval);
        return {
          ...prevState,
          [candidateId]: { ...currentTimer, isRunning: false, interval: null }
        };
      } else {
        // Start the timer
        const newInterval = setInterval(() => {
          setTimerState(innerState => ({
            ...innerState,
            [candidateId]: {
              ...innerState[candidateId],
              time: innerState[candidateId].time + 1
            }
          }));
        }, 1000);

        return {
          ...prevState,
          [candidateId]: { ...currentTimer, isRunning: true, interval: newInterval }
        };
      }
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return <div className="p-4 text-center">Se încarcă lista de candidați...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simulări candidați</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nume Candidat</th>
            <th className="py-2 px-4 border-b">Cronometru</th>
            <th className="py-2 px-4 border-b">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate._id}>
              <td className="py-2 px-4 border-b">{candidate.name}</td>
              <td className="py-2 px-4 border-b">
                {formatTime(timerState[candidate._id]?.time || 0)}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleStartStopTimer(candidate._id)}
                  className={`py-1 px-3 rounded text-white ${
                    timerState[candidate._id]?.isRunning ? 'bg-red-500' : 'bg-green-500'
                  }`}
                >
                  {timerState[candidate._id]?.isRunning ? 'Stop Simulare' : 'Start Simulare'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimulationsPage;