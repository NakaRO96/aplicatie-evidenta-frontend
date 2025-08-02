import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

// Placeholder pentru URL-ul public al backend-ului
// SCHIMBĂRI AICI: Am înlocuit "http://localhost:5000" cu adresa reală a backend-ului tău.
const BACKEND_URL = "https://backend.fabricadepolitisti-curs.ro";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            console.log('Token expirat, deconectare.');
            logout();
          } else {
            setUser(decoded.user);
            axios.defaults.headers.common['x-auth-token'] = token;
          }
        } catch (error) {
          console.error('Eroare la decodificarea sau verificarea tokenului:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (phoneNumber, password) => {
    try {
      // Folosește URL-ul backend-ului public
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, { phoneNumber, password });
      const { token: newToken, role } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      const decoded = jwtDecode(newToken);
      setUser(decoded.user);
      axios.defaults.headers.common['x-auth-token'] = newToken;

      return { success: true, role };
    } catch (err) {
      console.error('Eroare la autentificare:', err.response ? err.response.data.msg : err.message);
      return { success: false, error: err.response ? err.response.data.msg : 'Eroare la autentificare' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};