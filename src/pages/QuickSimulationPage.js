import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRunning, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CourseTimer from '../components/CourseTimer';

function QuickSimulationPage() {
    const [candidates, setCandidates] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showTimer, setShowTimer] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

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

    const handleStartSimulation = (candidate) => {
        setSelectedCandidate(candidate);
        setShowTimer(true);
    };

    const handleSimulationSaved = () => {
        setShowTimer(false);
        setSelectedCandidate(null);
        fetchCandidates(); // Reîmprospătează lista după ce simularea a fost salvată
    };

    const handleCancelSimulation = () => {
        setShowTimer(false);
        setSelectedCandidate(null);
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    // Filtrarea candidaților pe baza numelui sau numărului de telefon
    const filteredCandidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.phoneNumber && candidate.phoneNumber.includes(searchQuery))
    );

    // RENDERIZARE CONDIȚIONALĂ: Afișăm cronometrul dacă showTimer este true
    if (showTimer && selectedCandidate) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 font-sans antialiased flex items-center justify-center">
                <CourseTimer 
                    userId={selectedCandidate._id}
                    onSimulationSaved={handleSimulationSaved}
                    onCancel={handleCancelSimulation}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 sm:p-6 lg:p-8 font-sans antialiased">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/admin')}
                    className="inline-flex items-center text-blue-700 hover:text-blue-900 font-semibold mb-6 transition-colors duration-200 text-lg group"
                >
                    <FaArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
                    Înapoi la Panoul Administrator
                </button>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800 tracking-tight text-center mb-6">
                    Simulare Rapidă
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