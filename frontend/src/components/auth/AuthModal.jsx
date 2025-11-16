'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SignUpContainer from './SignUpContainer';

export default function AuthModal() {
  const [showSignUp, setShowSignUp] = useState(false);
  const pathname = usePathname();

  const handleCloseSignUp = () => {
    setShowSignUp(false);
  };

  useEffect(() => {
    // Only listen for events on pages other than home
    if (pathname === '/') return;

    const handleShowSignUp = () => {
      setShowSignUp(true);
      // Switch to signup tab
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('switchToSignup'));
      }, 100);
    };

    const handleShowLogin = () => {
      setShowSignUp(true);
      // Switch to login tab
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('switchToLogin'));
      }, 100);
    };

    window.addEventListener('showSignUp', handleShowSignUp);
    window.addEventListener('showLogin', handleShowLogin);

    return () => {
      window.removeEventListener('showSignUp', handleShowSignUp);
      window.removeEventListener('showLogin', handleShowLogin);
    };
  }, [pathname]);

  if (!showSignUp) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50">
      <div className="flex items-center justify-center min-h-full p-4">
        <SignUpContainer onClose={handleCloseSignUp} />
      </div>
    </div>
  );
}