import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vetmonk_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vetmonk_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('vetmonk_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = (authData) => {
    localStorage.setItem('vetmonk_token', authData.token);
    setToken(authData.token);
    const userData = {
      id: authData.id,
      name: authData.name,
      email: authData.email,
      role: authData.role,
      preferredLanguage: authData.preferredLanguage,
      clinicId: authData.clinicId
    };
    localStorage.setItem('vetmonk_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('vetmonk_token');
    localStorage.removeItem('vetmonk_user');
    setToken(null);
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isClinicAdmin = user?.role === 'CLINIC_ADMIN';
  const isVeterinarian = user?.role === 'VETERINARIAN';
  const isReceptionist = user?.role === 'RECEPTIONIST';
  const isPetOwner = user?.role === 'PET_OWNER';
  const isStaff = isSuperAdmin || isClinicAdmin || isVeterinarian || isReceptionist;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isSuperAdmin,
        isClinicAdmin,
        isVeterinarian,
        isReceptionist,
        isPetOwner,
        isStaff
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
