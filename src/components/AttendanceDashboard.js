// src/components/AttendanceDashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCheck } from 'react-icons/fa';
import { toast } from 'react-toastify'; // Folosim toast pentru notificări
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Preluăm contextul de autentificare

function AttendanceDashboard() {
    const [candidates, setCandidates] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const { logout } = useAuth();
    const navigate = useNavigate();

    // Folosim URL-ul de backend din codul tău
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
            // Filtrăm doar candidații care sunt utilizatori normali, dacă e cazul
            const filteredUsers = res.data.users.filter(user => user.role !== 'admin');
            setCandidates(filteredUsers);
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

    // Funcția pentru a trimite prezența la backend
    const handleAddAttendance = async (candidateId, candidateName) => {
        if (window.confirm(`Ești sigur că vrei să adaugi prezența pentru ${candidateName} pentru ziua de azi?`)) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${BACKEND_URL}/api/attendance/add`,
                    {
                        userId: candidateId,
                        date: new Date().toISOString().split('T')[0] // Data de azi
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                toast.success(response.data.msg);
            } catch (err) {
                console.error('Eroare la adăugarea prezenței:', err);
                const errorMessage = err.response?.data?.msg || 'Eroare la adăugarea prezenței.';
                toast.error(errorMessage);
            }
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    // Filtrarea candidaților pe baza numelui sau numărului de telefon
    const filteredCandidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.phoneNumber && candidate.phoneNumber.includes(searchQuery))
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4 sm:p-6 lg:p-8 font-sans antialiased">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800 tracking-tight text-center mb-6">
                    Înregistrare Prezență Rapidă
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
                            <h2 className="text-2xl font-bold mb-4 text-blue-700">Lista Candiaților</h2>
                            {filteredCandidates.length === 0 ? (
                                <p className="text-gray-600 text-lg text-center py-4">Nu s-au găsit candidați.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {filteredCandidates.map(candidate => (
                                        <li
                                            key={candidate._id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm"
                                        >
                                            <span className="text-lg font-medium text-gray-800">
                                                {candidate.name}
                                            </span>
                                            <button
                                                onClick={() => handleAddAttendance(candidate._id, candidate.name)}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 active:bg-green-800 transition-all duration-300 shadow-md flex items-center gap-2"
                                            >
                                                <FaUserCheck />
                                                Adaugă Prezența
                                            </button>
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

export default AttendanceDashboard;