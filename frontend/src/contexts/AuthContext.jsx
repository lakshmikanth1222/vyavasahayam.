import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vyava_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('vyava_token');
    setToken(null);
    setUser(null);
  };

  // Load user profile on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error("Auth check failed, logging out:", err);
          logout();
        }
      }
      setIsLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (emailOrPhone, password) => {
    const res = await api.post('/auth/login', {
      email_or_phone: emailOrPhone,
      password: password
    });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('vyava_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const registerFarmer = async (formData) => {
    const res = await api.post('/auth/register/farmer', formData);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('vyava_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const registerBuyer = async (formData) => {
    const res = await api.post('/auth/register/buyer', formData);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('vyava_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const registerConsumer = async (formData) => {
    const res = await api.post('/auth/register/consumer', formData);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('vyava_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  // 1-Click quick demo role switcher
  const switchDemoRole = async (targetRole) => {
    const roleCredentials = {
      FARMER: { email: 'farmer@vyavasahayam.org', pass: 'password123' },
      BUYER_B2B: { email: 'buyer@vyavasahayam.org', pass: 'password123' },
      CONSUMER_B2C: { email: 'consumer@vyavasahayam.org', pass: 'password123' },
      ADMIN: { email: 'admin@vyavasahayam.org', pass: 'password123' },
      COLLECTION_CENTER: { email: 'rythubazar@vyavasahayam.org', pass: 'password123' },
      DELIVERY_PARTNER: { email: 'delivery@vyavasahayam.org', pass: 'password123' }
    };
    const cred = roleCredentials[targetRole];
    if (cred) {
      return await login(cred.email, cred.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerFarmer,
        registerBuyer,
        registerConsumer,
        logout,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
