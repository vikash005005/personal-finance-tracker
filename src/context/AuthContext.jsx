import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USER } from '../constants/initialData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finance_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to demo user so the dashboard is immediately interactive and friendly
    return DEMO_USER;
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('finance_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [DEMO_USER];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('finance_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('finance_auth_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('finance_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const login = (email, password) => {
    const found = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (found) {
      setUser(found);
      return { success: true };
    }
    // If not found, create or allow login for demo experience
    const newUser = {
      name: email.split('@')[0],
      email: email.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
    };
    setUser(newUser);
    setRegisteredUsers((prev) => [...prev, newUser]);
    return { success: true };
  };

  const register = (name, email) => {
    const newUser = {
      name: name.trim(),
      email: email.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };
    setUser(newUser);
    setRegisteredUsers((prev) => [...prev.filter((u) => u.email !== newUser.email), newUser]);
    return { success: true };
  };

  const demoLogin = () => {
    setUser(DEMO_USER);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      setRegisteredUsers((users) =>
        users.map((u) => (u.email === prev?.email ? updated : u))
      );
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
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
