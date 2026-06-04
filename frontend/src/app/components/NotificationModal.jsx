'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function NotificationModal({ 
  isOpen, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  autoClose = false, 
  autoCloseDelay = 3000,
  zIndexClass = 'z-50',
  backdropBlur = true,
}) {

  useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  // Configuration object for styles based on type
  const modalStyles = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      buttonBg: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      defaultTitle: 'Success'
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      buttonBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      defaultTitle: 'Error'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      defaultTitle: 'Warning'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      defaultTitle: 'Information'
    }
  };

  const currentStyle = modalStyles[type] || modalStyles.info;
  const IconComponent = currentStyle.icon;

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4 sm:p-0`}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className={`absolute inset-0 bg-gray-900/40 transition-opacity ${backdropBlur ? 'backdrop-blur-sm' : ''}`}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto overflow-hidden ring-1 ring-black/5"
      >
        {/* Close Icon (Top Right) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          {/* Animated Icon Wrapper */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${currentStyle.iconBg}`}>
            <IconComponent className={`h-8 w-8 ${currentStyle.iconColor}`} />
          </div>

          {/* Text Content */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title || currentStyle.defaultTitle}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {message}
          </p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full py-3 px-4 rounded-xl text-white font-semibold shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentStyle.buttonBg}`}
          >
            Okay, got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}
