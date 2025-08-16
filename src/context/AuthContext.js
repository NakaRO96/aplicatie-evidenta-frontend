import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const BACKEND_URL = "https://aplicatie-evidenta-backend.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  // NOU: Stare explicită pentru rolul utilizatorului
  const [userRole, setUserRole] = useState(null); 
  // NOU: Stare explicită pentru autentificare, derivată din prezența utilizatorului
  const isAuthenticated = !!user; 

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setUserRole(null); // Resetează rolul la deconectare
    delete axios.defaults.headers.common['x-auth-token'];
  };

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
            // NOU: Setează rolul utilizatorului la inițializare
            setUserRole(decoded.user.role); 
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
  }, [token]); // Dependența pe 'token' e corectă aici

  const login = async (phoneNumber, password) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, { phoneNumber, password });
      const { token: newToken } = res.data; // Nu mai avem nevoie de 'role' separat aici, îl extragem din token
      
      localStorage.setItem('token', newToken);
      setToken(newToken); // Acest setToken va declanșa useEffect-ul de mai sus
      
      const decoded = jwtDecode(newToken);
      setUser(decoded.user);
      setUserRole(decoded.user.role); // NOU: Setează rolul imediat după login
      axios.defaults.headers.common['x-auth-token'] = newToken;

      return { success: true, role: decoded.user.role }; // Returnează rolul pentru LoginPage
    } catch (err) {
      console.error('Eroare la autentificare:', err.response ? err.response.data.msg : err.message);
      return { success: false, error: err.response ? err.response.data.msg : 'Eroare la autentificare' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated, userRole }}>
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
