import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      const data = await apiRequest('/auth/me');
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('reloop_token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      data: { email, password },
    });
    if (data.token) {
      localStorage.setItem('reloop_token', data.token);
    }
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      data: { name, email, password },
    });
    if (data.token) {
      localStorage.setItem('reloop_token', data.token);
    }
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout warning:', e);
    }
    localStorage.removeItem('reloop_token');
    setUser(null);
  }

  async function updateProfile(profileData) {
    const data = await apiRequest('/auth/profile', {
      method: 'PUT',
      data: profileData,
    });
    setUser(data.user);
    return data.user;
  }

  async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const data = await apiRequest('/auth/avatar', {
      method: 'POST',
      data: formData,
      isFormData: true,
    });
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
        refreshUser: checkCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
