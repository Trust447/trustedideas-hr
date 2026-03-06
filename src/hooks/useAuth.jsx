// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api.js';
import { MOCK_USER } from '../store/mockData.js';

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// Set VITE_USE_MOCK=true in .env to bypass API and use mock data
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function loadStoredUser() {
  try { return JSON.parse(localStorage.getItem('hr_user') ?? 'null'); }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(loadStoredUser);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 700));
        localStorage.setItem('hr_user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
        return MOCK_USER;
      }
      const { data } = await authApi.login(email, password);
      localStorage.setItem('access_token',  data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('hr_user',       JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.message || 'Invalid email or password';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { if (!USE_MOCK) await authApi.logout(); } catch { /* ignore */ }
    ['access_token','refresh_token','hr_user'].forEach((k) => localStorage.removeItem(k));
    setUser(null);
  }, []);

  const hasPermission = useCallback((p) => user?.permissions?.includes(p) ?? false, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, hasPermission, clearError: () => setError(null) }}>
      {children}
    </AuthContext.Provider>
  );
}
