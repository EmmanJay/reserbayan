'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Listen for user updates
    const handleUserUpdate = (e) => {
      setUser(e.detail);
    };

    const handleUserLogout = () => {
      setUser(null);
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    window.addEventListener('userLogout', handleUserLogout);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}