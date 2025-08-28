import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRunning, FaArrowLeft, FaPlay, FaPause, FaStop, FaTimes, FaSave, FaTrashAlt } from 'react-icons/fa'; // Am adăugat iconițe necesare
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom'; // Am adăugat Link
import { useAuth } from '../context/AuthContext';

function QuickSimulationPage() {
    // Stări pentru gestionarea listei de candidați și a selecției
    const [candidates, setCandidates] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    // Stări pentru cronometru și simulare
    const [timer, setTimer] = useState(0); // Timpul în milisecunde
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState([]); // Lista de ture/rezultate
    const [currentLapInput, setCurrentLapInput] = useState('');
    const [discipline, setDiscipline] = useState('');
    const [isTimerStopped, setIsTimerStopped] = useState(false); // Indică dacă cronometrul a fost oprit
    const [isSaving, setIsSaving] = useState(false); // Stare pentru a gestiona încărcarea la salvare

    const intervalRef = useRef(null); // Ref pentru a gestiona intervalul cronometrului
    const { logout } = useAuth();
    const navigate = useNavigate();

    const BACKEND_URL = 'https://aplicatie-evidenta-backend.onrender.com';

    // Funcția pentru a prelua toți candidații
    const fetchCandidates = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BACKEND_URL}/api/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCandidates(res.data.users);
        } catch (err) {
            console.error('Eroare la preluarea candidaților:', err);
            if (err.response && err.response.status === 401) {
                logout();
                navigate('/login');
                toast.error('Sesiunea a expirat.');
            } else {
                toast.error('A apărut o eroare la încărcarea datelor.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Efect pentru a porni/opri cronometrul
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimer(prevTime => prevTime + 10);
            }, 10);
        } else if (!isRunning && intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    // Funcție pentru a formata timpul în MM:SS:ms
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = (time % 1000) / 10;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    };

    // Funcții de control al cronometrului
    const handleStartPause = () => {
        setIsRunning(prev => !prev);
    };

    const handleStop = () => {
        setIsRunning(false);
        setIsTimerStopped(true); // Marchează cronometrul ca oprit pentru a permite salvarea
    };

    const handleReset = () => {
        if (window.confirm('Ești sigur că vrei să resetezi cronometrul și toate rezultatele?')) {
            clearInterval(intervalRef.current);
            setTimer(0);
            setIsRunning(false);
            setLaps([]);
            setCurrentLapInput('');
            setDiscipline('');
            setIsTimerStopped(false);
            setSelectedCandidate(null); // Resetăm candidatul selectat
            toast.info('Cronometrul și rezultatele au fost resetate.');
        }
    };

    const handleAddLap = () => {
        if (currentLapInput.trim() === '') {
            toast.error('Timpul turei nu poate fi gol.');
            return;
        }

        const newLap = {
            id: laps.length > 0 ? Math.max(...laps.map(lap => lap.id)) + 1 : 1, // Asigură ID unic
            time: currentLapInput,
            overallTime: formatTime(timer)
        };
        setLaps(prevLaps => [...prevLaps, newLap]);
        setCurrentLapInput('');
        toast.success(`Tura ${newLap.id} adăugată: ${newLap.time}`);
    };

    const handleDeleteLap = (id) => {
        setLaps(prevLaps => prevLaps.filter(lap => lap.id !== id));
        toast.info(`Tura ${id} ștearsă.`);
    };

    const handleLapInputChange = (e, id) => {
        const newLaps = laps.map(lap =>
            lap.id === id ? { ...lap, time: e.target.value } : lap
        );
        setLaps(newLaps);
    };

    // Funcția principală pentru salvarea rezultatelor simulării
    const handleSaveResults = async () => {
        if (!selectedCandidate) {
            toast.error('Niciun candidat selectat. Te rog să selectezi un candidat înainte de a salva.');
            return;
        }
        if (discipline.trim() === '') {
            toast.error('Numele disciplinei este obligatoriu pentru a salva rezultatele.');
            return;
        }
        if (laps.length === 0) {
            toast.error('Trebuie să adaugi cel puțin o tură pentru a salva rezultatele.');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                user: selectedCandidate._id, // Folosim 'user' conform schemei backend
                discipline,
                overallTime: formatTime(timer), // Timpul total al cronometrului
                laps: laps.map(lap => ({ time: lap.time, overallTime: lap.overallTime })),
                rawTime: timer / 1000, // Timpul brut în secunde
                penaltyTime: 0, // Aici poți adăuga logica pentru penalizări dacă e cazul
                totalTime: timer / 1000, // Aici poți adăuga logica pentru timp total cu penalizări
                penaltiesList: [],
                javelinTime: null,
                eliminatedObstaclesList: []
            };

            // NOTĂ: Asigură-te că endpoint-ul /api/simulations acceptă acest payload nou!
            await axios.post(`${BACKEND_URL}/api/simulations`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Rezultatele simulării au fost salvate cu succes în contul candidatului!');
            // Resetăm stările și revenim la lista de candidați
            handleReset();
            setSelectedCandidate(null);
            fetchCandidates(); // Reîmprospătează lista candidaților
        } catch (err) {
            console.error('Eroare la salvarea simulării:', err.response?.data?.msg || err.message);
            const errorMessage = err.response?.data?.msg || 'A apărut o eroare la salvarea simulării. Verifică log-urile backend-ului.';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Funcția pentru a începe simularea pentru un candidat selectat
    const handleStartSimulation = (candidate) => {
        setSelectedCandidate(candidate);
        // Resetăm cronometrul la pornirea unei noi simulări
        clearInterval(intervalRef.current);
        setTimer(0);
        setIsRunning(false);
        setLaps([]);
        setCurrentLapInput('');
        setDiscipline('');
        setIsTimerStopped(false);
    };

    // Se încarcă candidații la montarea componentei
    useEffect(() => {
        fetchCandidates();
    }, []);

    // Filtrarea candidaților
    const filteredCandidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.phoneNumber && candidate.phoneNumber.includes(searchQuery))
    );

    // Condiție de render: afișăm cronometrul dacă un candidat este selectat
    if (selectedCandidate) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 font-sans pt-24">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleReset} // Buton pentru a reveni la lista de candidați
                        className="inline-flex items-center text-blue-700 hover:text-blue-900 font-semibold mb-6 transition-colors duration-200 text-lg group"
                    >
                        <FaArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
                        Înapoi la Lista Candidaților
                    </button>

                    <div className="bg-white shadow-xl rounded-2xl p-6 border border-blue-100 mb-8">
                        <h1 className="text-3xl font-extrabold text-blue-800 text-center mb-4">
                            Simulare pentru: <span className="text-indigo-600">{selectedCandidate.name}</span>
                        </h1>
                        <div className="flex flex-col items-center mb-4">
                            <span className="text-6xl sm:text-8xl font-mono font-bold text-gray-800 mb-4 z-20">
                                {formatTime(timer)}
                            </span>
                            <div className="flex gap-4 mb-4">
                                <button
                                    onClick={handleStartPause}
                                    className={`p-4 rounded-full text-white transition-all duration-300 transform active:scale-95 shadow-lg ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                                >
                                    {isRunning ? <FaPause size={24} /> : <FaPlay size={24} />}
                                </button>
                                <button
                                    onClick={handleStop}
                                    className="p-4 rounded-full bg-red-500 text-white transition-all duration-300 transform active:scale-95 shadow-lg hover:bg-red-600"
                                >
                                    <FaStop size={24} />
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="p-4 rounded-full bg-gray-500 text-white transition-all duration-300 transform active:scale-95 shadow-lg hover:bg-gray-600"
                                >
                                    <FaTimes size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="flex flex-col">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Nume Disciplină:
                                </label>
                                <input
                                    type="text"
                                    value={discipline}
                                    onChange={(e) => setDiscipline(e.target.value)}
                                    placeholder="ex. Simulare Examen Scris"
                                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={!isTimerStopped && isRunning} // Editabil doar dacă oprit sau la început
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Adaugă Tură:
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={currentLapInput}
                                        onChange={(e) => setCurrentLapInput(e.target.value)}
                                        placeholder="ex. 1:30.50 sau 90.50"
                                        className="border border-gray-300 p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
                                        disabled={!isTimerStopped && !isRunning} // Editabil doar dacă oprit sau la început
                                    />
                                    <button
                                        onClick={handleAddLap}
                                        className="bg-blue-600 text-white p-3 rounded-r-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
                                        disabled={!isTimerStopped && !isRunning}
                                    >
                                        Adaugă
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {laps.length > 0 && (
                        <div className="bg-white shadow-xl rounded-2xl p-6 border border-blue-100">
                            <h2 className="text-2xl font-bold text-blue-700 mb-4">
                                Rezultate Tură
                            </h2>
                            <ul className="space-y-4 mb-6">
                                {laps.map((lap) => (
                                    <li key={lap.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                                            <span className="text-lg font-bold text-gray-800">
                                                Tura {lap.id}:
                                            </span>
                                            <input
                                                type="text"
                                                value={lap.time}
                                                onChange={(e) => handleLapInputChange(e, lap.id)}
                                                className="w-full sm:w-auto font-medium text-gray-600 border border-gray-300 rounded-md p-2"
                                                disabled={!isTimerStopped} // Editabil doar dacă cronometrul este oprit
                                            />
                                            <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                                                (Timp total: {lap.overallTime})
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteLap(lap.id)}
                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200 mt-2 sm:mt-0"
                                            disabled={!isTimerStopped} // Ștergere posibilă doar dacă cronometrul este oprit
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {isTimerStopped && (
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
                    )}
                </div>
            </div>
        );
    }

    // Render implicit: lista de candidați
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 sm:p-6 lg:p-8 font-sans antialiased pt-24">
            <div className="max-w-4xl mx-auto">
                <Link
                    to="/admin"
                    className="inline-flex items-center text-blue-700 hover:text-blue-900 font-semibold mb-6 transition-colors duration-200 text-lg group"
                >
                    <FaArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
                    Înapoi la Panoul Administrator
                </Link>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800 tracking-tight text-center mb-6">
                    Simulare Rapidă - Selectează Candidatul
                </h1>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white shadow-xl rounded-2xl p-8 border border-blue-100">
                        <p className="text-2xl font-bold text-gray-700">Se încarcă lista de candidați...</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white shadow-lg rounded-xl p-4 mb-6">
                            <input
                                type="text"
                                placeholder="Caută candidat după nume sau telefon..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 shadow-sm"
                            />
                        </div>
                        <div className="bg-white shadow-xl rounded-2xl p-6 border border-blue-100">
                            <h2 className="text-2xl font-bold mb-4 text-blue-700">Lista Candidaților</h2>
                            {filteredCandidates.length === 0 ? (
                                <p className="text-gray-600 text-lg text-center py-4">Nu s-au găsit candidați.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {filteredCandidates.map(candidate => (
                                        <li
                                            key={candidate._id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm"
                                        >
                                            <span className="text-lg font-medium text-gray-800 mb-2 sm:mb-0">
                                                {candidate.name}
                                            </span>
                                            <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                                                <button
                                                    onClick={() => handleStartSimulation(candidate)}
                                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 active:bg-purple-800 transition-all duration-300 shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
                                                >
                                                    <FaRunning />
                                                    Start Simulare
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default QuickSimulationPage;