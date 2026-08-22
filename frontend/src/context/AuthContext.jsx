import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('lm_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lm_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem('lm_user', JSON.stringify(res.data.data));
      })
      .catch(() => {
        localStorage.removeItem('lm_token');
        localStorage.removeItem('lm_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const data = res.data.data;
    localStorage.setItem('lm_token', data.token);
    localStorage.setItem('lm_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    const data = res.data.data;
    localStorage.setItem('lm_token', data.token);
    localStorage.setItem('lm_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('lm_token');
    localStorage.removeItem('lm_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
