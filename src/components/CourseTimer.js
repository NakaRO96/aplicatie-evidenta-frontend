import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const obstacole = [
  "Săritura lungime", "Pas sărit", "Rostogoliri", "Bancă greutăți",
  "Șicane", "Săritură capră", "Obstacol marcat", "Escaladare ladă",
  "Manechin", "Aruncare minge", "Detentă verticală", "Navetă"
];
const penaltySeconds = 3;

function formatTime(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function CourseTimer({ userId, onSimulationSaved }) {
  const [timerDisplay, setTimerDisplay] = useState('00:00');
  const [rawTimeDisplay, setRawTimeDisplay] = useState('Timp fără penalizări: -');
  const [finalTimeDisplay, setFinalTimeDisplay] = useState('Timp total cu penalizări: -');
  const [penaltyTimeDisplay, setPenaltyTimeDisplay] = useState('Penalizări: -');
  const [penaltyListDisplay, setPenaltyListDisplay] = useState('Obstacole penalizate: -');
  const [eliminatedListDisplay, setEliminatedListDisplay] = useState('Obstacole eliminate: -');

  // Stări și referințe pentru Timp Jaloane (păstrate conform codului tău inițial)
  const [javelinTimeDisplay, setJavelinTimeDisplay] = useState('Timp Jaloane: -');
  const javelinStartTimeRef = useRef(null); // Timpul când s-a apăsat butonul Timp Jaloane
  const [javelinTimerActive, setJavelinTimerActive] = useState(false); // Starea butonului Timp Jaloane

  const [timerRunning, setTimerRunning] = useState(false);

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const penaltiesRef = useRef([]);
  const eliminatedObstaclesRef = useRef([]); // Păstrat eliminatedObstaclesRef

  useEffect(() => {
    resetAll();
  }, [userId]);

  // Actualizează afișajul rezultatelor curente
  const updateDisplay = (finalT, penaltyT, penaltiesL, eliminatedL, javelinT) => {
    setFinalTimeDisplay(`Timp total cu penalizări: ${finalT}`);
    setPenaltyTimeDisplay(`Penalizări: ${penaltyT}`);
    setPenaltyListDisplay(`Obstacole penalizate: ${penaltiesL}`);
    setEliminatedListDisplay(`Obstacole eliminate: ${eliminatedL}`);
    setJavelinTimeDisplay(`Timp Jaloane: ${javelinT}`);
  };

  const startTimer = () => {
    if (!userId) {
      alert("Eroare: Niciun utilizator selectat pentru simulare. Reîncarcă pagina sau selectează un utilizator.");
      return;
    }
    if (timerRunning) {
      alert("Cronometrul este deja pornit.");
      return;
    }
    penaltiesRef.current = [];
    eliminatedObstaclesRef.current = [];
    javelinStartTimeRef.current = null;
    setJavelinTimerActive(false);
    updateDisplay('-', '-', 'Niciunul', 'Niciunul', '-');
    setRawTimeDisplay("Timp fără penalizări: -");
    clearInterval(intervalRef.current);

    startTimeRef.current = Date.now();
    setTimerRunning(true);

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimerDisplay(formatTime(elapsed));
    }, 500);
  };

  const startJavelinTimer = () => {
    if (!timerRunning) {
      alert("Te rog să pornești cronometrul principal înainte de a măsura timpul jaloanelor.");
      return;
    }
    if (javelinTimerActive) {
      alert("Cronometrul pentru jaloane este deja pornit.");
      return;
    }
    javelinStartTimeRef.current = Date.now();
    setJavelinTimerActive(true);
    setJavelinTimeDisplay('Timp Jaloane: ...');
    alert("Cronometrul pentru jaloane a pornit!");
  };

  const stopTimer = async () => {
    if (!timerRunning) {
      alert("Cronometrul nu este pornit.");
      return;
    }
    clearInterval(intervalRef.current);
    setTimerRunning(false);

    const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const totalPenaltySeconds = penaltiesRef.current.length * penaltySeconds;
    const finalTotalSeconds = elapsedSeconds + totalPenaltySeconds;

    let finalJavelinTime = null;
    if (javelinTimerActive && javelinStartTimeRef.current) {
      finalJavelinTime = Math.floor((Date.now() - javelinStartTimeRef.current) / 1000);
    }
    setJavelinTimerActive(false);

    setRawTimeDisplay(`Timp fără penalizări: ${formatTime(elapsedSeconds)}`);
    updateDisplay(
      formatTime(finalTotalSeconds),
      `${penaltiesRef.current.length} x 3s = ${totalPenaltySeconds}s`,
      penaltiesRef.current.join(', ') || 'Niciunul',
      eliminatedObstaclesRef.current.join(', ') || 'Niciunul',
      finalJavelinTime !== null ? formatTime(finalJavelinTime) : '-'
    );

    try {
      await axios.post('http://localhost:5000/api/simulations', {
        userId: userId,
        rawTime: elapsedSeconds,
        penaltyTime: totalPenaltySeconds,
        totalTime: finalTotalSeconds,
        penaltiesList: penaltiesRef.current,
        eliminatedObstaclesList: eliminatedObstaclesRef.current, // Păstrat eliminatedObstaclesList
        javelinTime: finalJavelinTime, // Păstrat javelinTime
      });
      alert('Rezultatul simulării a fost salvat cu succes în contul utilizatorului!');
      if (onSimulationSaved) {
        onSimulationSaved();
      }
      resetAll();
    } catch (error) {
      console.error('Eroare la salvarea rezultatului simulării:', error.response ? error.response.data : error.message);
      alert('A apărut o eroare la salvarea rezultatului simulării. Verifică consola pentru detalii.');
    }
  };

  const resetAll = () => {
    clearInterval(intervalRef.current);
    setTimerRunning(false);
    setTimerDisplay("00:00");
    updateDisplay('-', '-', 'Niciunul', 'Niciunul', '-');
    setRawTimeDisplay("Timp fără penalizări: -");
    penaltiesRef.current = [];
    eliminatedObstaclesRef.current = [];
    javelinStartTimeRef.current = null;
    setJavelinTimerActive(false);
  };

  const addPenalty = (obstacle) => {
    if (!timerRunning) {
      alert("Te rog să pornești cronometrul înainte de a adăuga penalizări.");
      return;
    }
    penaltiesRef.current = [...penaltiesRef.current, obstacle];
    updateDisplay(
      finalTimeDisplay.split(': ')[1],
      penaltyTimeDisplay.split(': ')[1],
      penaltiesRef.current.join(', ') || 'Niciunul',
      eliminatedObstaclesRef.current.join(', ') || 'Niciunul',
      javelinTimeDisplay.split(': ')[1]
    );
  };

  const addEliminated = (obstacle) => {
    if (!timerRunning) {
      alert("Te rog să pornești cronometrul înainte de a marca obstacole eliminate.");
      return;
    }
    eliminatedObstaclesRef.current = [...eliminatedObstaclesRef.current, obstacle];
    updateDisplay(
      finalTimeDisplay.split(': ')[1],
      penaltyTimeDisplay.split(': ')[1],
      penaltiesRef.current.join(', ') || 'Niciunul',
      eliminatedObstaclesRef.current.join(', ') || 'Niciunul',
      javelinTimeDisplay.split(': ')[1]
    );
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-100 to-indigo-200 min-h-screen p-4 sm:p-6 font-sans antialiased flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-blue-800 tracking-tight mb-6">
          Monitorizare Timp Traseu Aplicativ
        </h1>

        {/* Container FIXED/STICKY pentru butoane STOP, JALOANE și CRONOMETRU */}
        {/* Acesta va conține toate elementele care devin sticky și mai mici */}
        <div className="sticky top-0 z-50 bg-white p-2 shadow-md rounded-b-lg -mx-4 sm:-mx-6 lg:-mx-8 mb-4">
            <div className="flex justify-center gap-2 mb-2"> {/* Rând pentru cele două butoane */}
                <button
                  onClick={stopTimer}
                  className={`flex items-center justify-center px-2 py-1 rounded-lg text-sm font-semibold transition-all duration-300 ${!timerRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg'} text-white`}
                  disabled={!timerRunning}
                >
                  Stop Timp
                </button>
                <button
                  onClick={startJavelinTimer}
                  className={`flex items-center justify-center px-2 py-1 rounded-lg text-sm font-semibold transition-all duration-300 ${javelinTimerActive ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'} text-white`}
                  disabled={javelinTimerActive || !timerRunning}
                >
                  Start Timp Jaloane
                </button>
            </div>
            {/* Afișaj Cronometru Principal - acum inclus în containerul sticky și mai mic */}
            <div className="text-center text-2xl sm:text-3xl font-extrabold text-blue-900 font-mono bg-blue-50 p-2 rounded-lg shadow-inner">
              {timerDisplay}
            </div>
        </div>

        {/* Butoanele principale care NU sunt sticky (Start Cursă, Reset) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <button
            onClick={startTimer}
            className={`flex items-center justify-center px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${timerRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg'} text-white`}
            disabled={timerRunning}
          >
            Start Cursă
          </button>
          <button
            onClick={resetAll}
            className="flex items-center justify-center bg-gray-500 text-white px-4 py-3 rounded-xl text-lg font-semibold hover:bg-gray-600 active:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Reset
          </button>
        </div>

        {/* Secțiunea Obstacole */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
            Acțiuni Obstacole
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {obstacole.map((obstacle, index) => (
              <div key={index} className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                {/* Textul obstacolului mai mic */}
                <p className="text-base font-medium text-gray-800 text-center mb-2">{obstacle}</p>
                {/* Butoanele de acțiune mai înalte */}
                <button
                  onClick={() => addPenalty(obstacle)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white px-4 py-3 rounded-md font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!timerRunning}
                >
                  Penalizare ({penaltySeconds}s)
                </button>
                {/* Butoanele de acțiune mai înalte */}
                <button
                  onClick={() => addEliminated(obstacle)}
                  className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-4 py-3 rounded-md font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!timerRunning}
                >
                  Eliminat
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Secțiunea Rezultat Curent */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="font-bold text-xl sm:text-2xl text-blue-800 mb-4 text-center">
            Rezultat Curent al Simulării:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
            <p className="text-lg font-medium">
              <span className="font-semibold text-blue-700">Timp fără penalizări:</span> {rawTimeDisplay.split(': ')[1]}
            </p>
            <p className="text-lg font-medium">
              <span className="font-semibold text-blue-700">Timp total cu penalizări:</span> {finalTimeDisplay.split(': ')[1]}
            </p>
            <p className="text-lg font-medium">
              <span className="font-semibold text-blue-700">Timp Jaloane:</span> {javelinTimeDisplay.split(': ')[1]}
            </p>
            <p className="text-lg font-medium">
              <span className="font-semibold text-blue-700">Penalizări:</span> {penaltyTimeDisplay.split(': ')[1]}
            </p>
            <p className="text-lg font-medium col-span-1 md:col-span-2">
              <span className="font-semibold text-blue-700">Obstacole penalizate:</span> {penaltyListDisplay.split(': ')[1]}
            </p>
            <p className="text-lg font-medium col-span-1 md:col-span-2">
              <span className="font-semibold text-blue-700">Obstacole eliminate:</span> {eliminatedListDisplay.split(': ')[1]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseTimer;