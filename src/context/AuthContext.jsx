import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.signin({ email, password });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.result));
      setUser(data.result);
      return { success: true, user: data.result };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ firstName, lastName, email, password }) => {
    setLoading(true);
    try {
      const { data } = await authAPI.signup({ firstName, lastName, email, password });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.result));
      setUser(data.result);
      return { success: true, user: data.result };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user?._id) return;
    try {
      const { data } = await authAPI.getMe(user._id);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch {
      // silently fail
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
