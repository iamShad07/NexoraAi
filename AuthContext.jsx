import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexora_token'));
  const [adminToken, setAdminToken] = useState(localStorage.getItem('nexora_admin_token'));
  const [loading, setLoading] = useState(true);
  const [showLoginWelcome, setShowLoginWelcome] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('nexora_user');
      const savedAdmin = localStorage.getItem('nexora_admin');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('nexora_user', JSON.stringify(res.user));
          }
        } catch (e) {
          console.warn('Session refresh error:', e.message);
          localStorage.removeItem('nexora_token');
          localStorage.removeItem('nexora_user');
          setUser(null);
          setToken(null);
        }
      }

      if (adminToken && savedAdmin) {
        try {
          setAdminUser(JSON.parse(savedAdmin));
        } catch (e) {
          localStorage.removeItem('nexora_admin_token');
          localStorage.removeItem('nexora_admin');
          setAdminUser(null);
          setAdminToken(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('nexora_token', userToken);
    localStorage.setItem('nexora_user', JSON.stringify(userData));
    setShowLoginWelcome(true);
    setTimeout(() => {
      setShowLoginWelcome(false);
    }, 2000);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
  };

  const loginAdmin = (adminData, admToken) => {
    setAdminUser(adminData);
    setAdminToken(admToken);
    localStorage.setItem('nexora_admin_token', admToken);
    localStorage.setItem('nexora_admin', JSON.stringify(adminData));
    localStorage.setItem('nexora_token', admToken);
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('nexora_admin_token');
    localStorage.removeItem('nexora_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        token,
        adminToken,
        loading,
        showLoginWelcome,
        loginUser,
        logoutUser,
        loginAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
