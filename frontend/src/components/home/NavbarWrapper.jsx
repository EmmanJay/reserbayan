'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import UserNavbar from './UserNavbar';

export default function NavbarWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check initial login state from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
    }
    setMounted(true);

    // Listen for login/logout events
    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => setIsLoggedIn(false);

    window.addEventListener('userLogin', handleLogin);
    window.addEventListener('userLogout', handleLogout);

    return () => {
      window.removeEventListener('userLogin', handleLogin);
      window.removeEventListener('userLogout', handleLogout);
    };
  }, []);

  if (!mounted) {
    return <Navbar />;
  }

  return isLoggedIn ? <UserNavbar /> : <Navbar />;
}