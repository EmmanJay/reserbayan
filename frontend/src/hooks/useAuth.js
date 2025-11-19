import { useState, useEffect } from 'react';

export function useAuth() {
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

  return { user };
}