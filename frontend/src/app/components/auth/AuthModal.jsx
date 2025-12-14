'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SignUpContainer from './SignUpContainer';

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleShowLogin = () => {
      if (pathname === '/') {
        // On home page, let HeroSection handle it
        return;
      }
      setIsOpen(true);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('switchToLogin'));
      }, 100);
    };

    const handleShowSignUp = () => {
      if (pathname === '/') {
        // On home page, let HeroSection handle it
        return;
      }
      setIsOpen(true);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('switchToSignup'));
      }, 100);
    };

    window.addEventListener('showLogin', handleShowLogin);
    window.addEventListener('showSignUp', handleShowSignUp);

    return () => {
      window.removeEventListener('showLogin', handleShowLogin);
      window.removeEventListener('showSignUp', handleShowSignUp);
    };
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-[650px] w-full max-h-[90vh] overflow-y-auto">
        <SignUpContainer onClose={handleClose} />
      </div>
    </div>
  );
}
