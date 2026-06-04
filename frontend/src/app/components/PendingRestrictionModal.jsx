'use client';

import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export default function PendingRestrictionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-lg shadow-sm max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Account Pending Approval</h3>
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Your account is currently pending approval from the super administrator.
              You can browse available documents, but document requests are restricted until your account is approved.
            </p>

            <div className="bg-[#eef3ff] p-4 rounded-lg">
              <p className="text-sm text-[#122361]">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-sm text-[#122361] mt-2 space-y-1">
                <li>• Your registration information is being reviewed</li>
                <li>• You'll receive approval notification once processed</li>
                <li>• Approved residents can request documents immediately</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-[#243b8e] text-white px-4 py-2 rounded-lg hover:bg-[#122361] transition-colors font-medium"
            >
              I Understand
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}