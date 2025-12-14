import { motion } from 'framer-motion';
import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function RejectedResubmitModal({ isOpen, onClose, onResubmit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative mx-auto p-4 max-w-sm h-full flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl w-full overflow-hidden shadow-2xl border border-gray-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 w-10 h-10 flex items-center justify-center rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="font-montserrat font-bold text-lg text-red-900">
                  Account Rejected
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Your account is rejected. You cannot request documents until you resubmit your application.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5">
                <RefreshCw className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="text-gray-700 font-medium mb-1">To resubmit:</p>
                <ul className="text-gray-600 space-y-0.5 ml-2">
                  <li>• Review your information</li>
                  <li>• Update if needed</li>
                  <li>• Submit for approval</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onResubmit}
              className="px-4 py-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
            >
              Resubmit
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}