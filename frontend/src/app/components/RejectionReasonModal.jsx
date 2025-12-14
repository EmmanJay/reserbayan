import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RejectionReasonModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title = "Reject Request",
  itemName = "",
  loading = false 
}) {
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!reason.trim()) {
      newErrors.reason = 'Rejection reason is required';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Please provide a more detailed reason (at least 10 characters)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(reason.trim());
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="rejection-modal-title">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose}></div>

      <div className="relative mx-auto p-2 sm:p-4 max-w-md h-full flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl w-full shadow-2xl border border-gray-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-2 w-10 h-10 flex-shrink-0 flex items-center justify-center shadow-md">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 id="rejection-modal-title" className="font-montserrat font-bold text-xl text-red-900">
                  {title}
                </h2>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {itemName && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Rejecting:</p>
                <p className="font-semibold text-gray-900">{itemName}</p>
              </div>
            )}

            <div>
              <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejection-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) {
                    setErrors(prev => ({ ...prev, reason: '' }));
                  }
                }}
                placeholder="Please provide a detailed reason for rejection..."
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none ${
                  errors.reason ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This reason will be sent to the applicant and displayed in notifications.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Rejecting...
                  </>
                ) : (
                  'Reject Request'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}