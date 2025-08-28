import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPlay, FaStop, FaRedo, FaSave, FaRunning } from 'react-icons/fa';

const obstacole = [
  "Săritura lungime", "Pas sărit", "Rostogoliri", "Bancă greutăți",
  "Șicane", "Săritură capră", "Obstacol marcat", "Escaladare ladă",
  "Manechin", "Aruncare minge", "Detentă verticală", "Navetă"
];
const penaltySeconds = 3;
const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

function formatTime(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
    return '00:00.00';
  }
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = (totalSeconds % 60).toFixed(2).padStart(5, '0');
  return `${minutes}:${seconds}`;
}

function CourseTimer({ userId, onSimulationSaved, onCancel }) {
  const [timerDisplay, setTimerDisplay] = useState('00:00.00');
  const [timerRunning, setTimerRunning] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [javelinTimerActive, setJavelinTimerActive] = useState(false);

  const [penalties, setPenalties] = useState([]);
  const [eliminatedObstacles, setEliminatedObstacles] = useState([]);

  const [rawTime, setRawTime] = useState(0);
  const [penaltyTime, setPenaltyTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [javelinTime, setJavelinTime] = useState(null);

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const javelinStartTimeRef = useRef(null);

  const { user: authUser } = useAuth();

  useEffect(() => {
    if (timerRunning) {
      startTimeRef.current = Date.now() - rawTime * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setRawTime(elapsed);
        setTimerDisplay(formatTime(elapsed));
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, rawTime]);

  useEffect(() => {
    const newPenaltyTime = penalties.length * penaltySeconds;
    setPenaltyTime(newPenaltyTime);
    setTotalTime(rawTime + newPenaltyTime);
  }, [penalties, rawTime]);

  const startTimer = () => {
    if (!userId) {
      toast.error("Eroare: Niciun utilizator selectat pentru simulare. Reîncarcă pagina sau selectează un utilizator.");
      return;
    }
    if (timerRunning) {
      toast.warn("Cronometrul este deja pornit.");
      return;
    }

    setPenalties([]);
    setEliminatedObstacles([]);
    setRawTime(0);
    setPenaltyTime(0);
    setTotalTime(0);
    setJavelinTime(null);
    setJavelinTimerActive(false);
    setIsStopped(false);

    setTimerRunning(true);
  };

  const stopTimer = () => {
    if (!timerRunning) {
      toast.error("Cronometrul nu este pornit.");
      return;
    }
    setTimerRunning(false);
    setIsStopped(true);
  };

  const resetAll = () => {
    setTimerRunning(false);
    setTimerDisplay("00:00.00");
    setPenalties([]);
    setEliminatedObstacles([]);
    setRawTime(0);
    setPenaltyTime(0);
    setTotalTime(0);
    setJavelinTime(null);
    setJavelinTimerActive(false);
    setIsStopped(false);
  };

  const addPenalty = (obstacle) => {
    if (!timerRunning && !isStopped) {
      toast.error("Te rog să pornești sau să oprești cronometrul înainte de a adăuga penalizări.");
      return;
    }
    setPenalties(prevPenalties => {
        if (prevPenalties.includes(obstacle)) {
            toast.info(`Penalizare pentru ${obstacle} a fost ștearsă.`);
            return prevPenalties.filter(item => item !== obstacle);
        } else {
            toast.warn(`Penalizare adăugată pentru: ${obstacle}`);
            return [...prevPenalties, obstacle];
        }
    });
  };

  const addEliminated = (obstacle) => {
    if (!timerRunning && !isStopped) {
        toast.error("Te rog să pornești sau să oprești cronometrul înainte de a marca obstacole eliminate.");
        return;
    }
    setEliminatedObstacles(prevEliminated => {
        if (prevEliminated.includes(obstacle)) {
            toast.info(`Obstacolul ${obstacle} nu mai este marcat ca eliminat.`);
            return prevEliminated.filter(item => item !== obstacle);
        } else {
            toast.error(`Obstacol marcat ca eliminat: ${obstacle}`);
            return [...prevEliminated, obstacle];
        }
    });
  };

  const startJavelinTimer = () => {
    if (!timerRunning) {
      toast.error("Te rog să pornești cronometrul principal înainte de a măsura timpul jaloanelor.");
      return;
    }
    if (javelinTimerActive) {
      toast.warn("Cronometrul pentru jaloane este deja pornit.");
      return;
    }
    javelinStartTimeRef.current = Date.now();
    setJavelinTimerActive(true);
    toast.info("Cronometrul pentru jaloane a pornit!");
  };

  const handleSaveResults = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BACKEND_URL}/api/simulations`, {
        user: userId,
        rawTime: rawTime,
        penaltyTime: penaltyTime,
        totalTime: totalTime,
        penaltiesList: penalties,
        eliminatedObstaclesList: eliminatedObstacles,
        javelinTime: javelinTime,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Rezultatul simulării a fost salvat cu succes!');
      if (onSimulationSaved) {
        onSimulationSaved();
      }
      resetAll();
    } catch (error) {
      console.error('Eroare la salvarea rezultatului simulării:', error.response ? error.response.data : error.message);
      toast.error('A apărut o eroare la salvarea rezultatului simulării. Verifică consola pentru detalii.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleTimeChange = (e, setter) => {
    setter(parseFloat(e.target.value) || 0);
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 to-indigo-200 min-h-screen p-4 sm:p-6 font-sans antialiased flex flex-col items-center justify-center pt-24">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 transform transition-all duration-300 hover:shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onCancel}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
          >
            <FaRedo /> Anulează și alege alt candidat
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-blue-800 tracking-tight flex-1">
            Monitorizare Timp Traseu Aplicativ
          </h1>
        </div>

        <div className="sticky top-0 z-50 bg-white p-2 shadow-md rounded-b-lg -mx-4 sm:-mx-6 lg:-mx-8 mb-4">
          <div className="text-center text-3xl font-extrabold text-blue-900 font-mono bg-blue-50 p-4 rounded-lg shadow-inner">
            {timerDisplay}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={stopTimer}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ${!timerRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg'} text-white`}
              disabled={!timerRunning}
            >
              <FaStop className="mr-2" /> Stop Timp
            </button>
            <button
              onClick={startJavelinTimer}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ${javelinTimerActive || !timerRunning ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'} text-white`}
              disabled={javelinTimerActive || !timerRunning}
            >
              <FaRunning className="mr-2" /> Start Timp Jaloane
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={startTimer}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${timerRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg'} text-white`}
            disabled={timerRunning}
          >
            <FaPlay className="mr-2" /> Start Cursă
          </button>
          <button
            onClick={resetAll}
            className="flex-1 flex items-center justify-center bg-gray-500 text-white px-4 py-3 rounded-xl text-lg font-semibold hover:bg-gray-600 active:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-300 mt-2 sm:mt-0"
          >
            <FaRedo className="mr-2" /> Reset
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
            Acțiuni Obstacole
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {obstacole.map((obstacle, index) => (
              <div key={index} className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <p className="text-base font-medium text-gray-800 text-center mb-2">{obstacle}</p>
                <button
                  onClick={() => addPenalty(obstacle)}
                  className={`w-full text-white px-6 py-3 rounded-md font-semibold text-lg transition-all duration-200 ${!timerRunning && !isStopped ? 'opacity-50 cursor-not-allowed' : (penalties.includes(obstacle) ? 'bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700')}`}
                  disabled={!timerRunning && !isStopped}
                >
                  {penalties.includes(obstacle) ? 'Anulează penalizarea' : `Penalizare (${penaltySeconds}s)`}
                </button>
                <button
                  onClick={() => addEliminated(obstacle)}
                  className={`w-full text-white px-6 py-3 rounded-md font-semibold text-lg transition-all duration-200 ${!timerRunning && !isStopped ? 'opacity-50 cursor-not-allowed' : (eliminatedObstacles.includes(obstacle) ? 'bg-red-700' : 'bg-red-500 hover:bg-red-600 active:bg-red-700')}`}
                  disabled={!timerRunning && !isStopped}
                >
                  {eliminatedObstacles.includes(obstacle) ? 'Anulează Eliminarea' : 'Eliminat'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="font-bold text-xl sm:text-2xl text-blue-800 mb-4 text-center">
            Rezultat Curent al Simulării:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-blue-700 mb-1">Timp fără penalizări:</label>
              <input
                type="number"
                step="0.01"
                value={rawTime.toFixed(2)}
                onChange={(e) => handleTimeChange(e, setRawTime)}
                className="w-full p-2 rounded-lg text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0"
                readOnly={timerRunning}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-blue-700 mb-1">Timp total cu penalizări:</label>
              <input
                type="number"
                step="0.01"
                value={totalTime.toFixed(2)}
                onChange={(e) => handleTimeChange(e, setTotalTime)}
                className="w-full p-2 rounded-lg text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0"
                readOnly={timerRunning}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-blue-700 mb-1">Timp Jaloane:</label>
              <input
                type="number"
                step="0.01"
                value={javelinTime !== null ? javelinTime.toFixed(2) : ''}
                onChange={(e) => handleTimeChange(e, setJavelinTime)}
                className="w-full p-2 rounded-lg text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0"
                readOnly={javelinTimerActive || timerRunning}
              />
            </div>
            <p className="text-lg font-medium">
              <span className="font-semibold text-blue-700">Penalizări:</span> {penalties.length} x {penaltySeconds}s = {penaltyTime.toFixed(2)}s
            </p>
            <p className="text-lg font-medium col-span-1 md:col-span-2">
              <span className="font-semibold text-blue-700">Obstacole penalizate:</span> {penalties.join(', ') || 'Niciunul'}
            </p>
            <p className="text-lg font-medium col-span-1 md:col-span-2">
              <span className="font-semibold text-blue-700">Obstacole eliminate:</span> {eliminatedObstacles.join(', ') || 'Niciunul'}
            </p>
          </div>
        </div>

        {isStopped && (
          <button
            onClick={handleSaveResults}
            disabled={isSaving}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            {isSaving ? (
              <>
                <FaRunning className="animate-spin" />
                Se salvează...
              </>
            ) : (
              <>
                <FaSave />
                Salvează Rezultatul
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default CourseTimer;