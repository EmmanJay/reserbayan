'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <motion.div
            className="w-full max-w-[660px]"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <SignUpContainer onClose={handleClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
