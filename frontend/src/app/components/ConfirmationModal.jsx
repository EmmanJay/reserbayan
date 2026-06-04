'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type = 'warning',
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700'
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="w-8 h-8 text-red-600" />;
      case 'approve':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'reject':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-50 border-red-200';
      case 'approve':
        return 'bg-green-50 border-green-200';
      case 'reject':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-[90]">
      <motion.div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border ${getBgColor()}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            {getIcon()}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleConfirm}
              className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors font-medium ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
