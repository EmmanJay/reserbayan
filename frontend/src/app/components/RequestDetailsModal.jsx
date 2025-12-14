'use client';

import { motion } from 'framer-motion';
import { X, User, FileText, Calendar, Clock, Info, Paperclip } from 'lucide-react';

export default function RequestDetailsModal({
  isOpen,
  onClose,
  requestDetails,
  loading = false,
  onApprove,
  onReject
}) {
  if (!isOpen || !requestDetails) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0" onClick={handleBackdropClick}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto overflow-hidden ring-1 ring-black/5"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Request Details</h2>
                <p className="text-sm text-slate-600">View detailed information about this document request</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
              <span className="ml-3 text-slate-600">Loading request details...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Request Header */}
              <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] rounded-xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center font-bold text-xl text-[#1E2566]">
                    {requestDetails.resident?.charAt(0) || 'R'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {requestDetails.documentName}
                    </h3>
                    <p className="text-blue-100 flex items-center gap-2 mt-1">
                      <User className="w-4 h-4" />
                      {requestDetails.resident}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(requestDetails.status)}`}>
                        {requestDetails.status}
                      </span>
                      {requestDetails.attachmentCount > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                          <Paperclip className="w-3 h-3 mr-1" />
                          {requestDetails.attachmentCount} attachment{requestDetails.attachmentCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Request Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Document Type</label>
                      <p className="text-sm font-medium text-slate-900">{requestDetails.documentName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Request ID</label>
                      <p className="text-sm font-medium text-slate-900">#{requestDetails.id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(requestDetails.status)}`}>
                          {requestDetails.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date Submitted</label>
                      <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {requestDetails.submittedAt ? formatDate(requestDetails.submittedAt) : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Time Submitted</label>
                      <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {requestDetails.submittedAt ? formatTime(requestDetails.submittedAt) : 'Unknown'}
                      </p>
                    </div>
                    {requestDetails.updatedAt && (
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Updated</label>
                        <p className="text-sm font-medium text-slate-900">
                          {formatDate(requestDetails.updatedAt)} at {formatTime(requestDetails.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resident Information */}
              {requestDetails.resident && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Resident Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</label>
                      <p className="text-sm font-medium text-slate-900">{requestDetails.resident}</p>
                    </div>
                    {requestDetails.email && (
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</label>
                        <p className="text-sm font-medium text-slate-900">{requestDetails.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Request Details/Purpose */}
              {requestDetails.details && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Purpose/Details
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{requestDetails.details}</p>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {requestDetails.attachmentCount > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Paperclip className="w-5 h-5" />
                    Attachments
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      This request has {requestDetails.attachmentCount} attachment{requestDetails.attachmentCount !== 1 ? 's' : ''}.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: requestDetails.attachmentCount }, (_, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          <Paperclip className="w-3 h-3 mr-1" />
                          Attachment {i + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            {/* Action buttons - only show for pending requests */}
            {requestDetails?.status === 'Pending' && (
              <div className="flex gap-3 justify-end mb-4">
                <button
                  onClick={() => onReject(requestDetails.id)}
                  className="px-6 py-2 bg-white border border-red-200 text-red-700 rounded-xl font-medium hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => onApprove(requestDetails.id)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                >
                  Approve Request
                </button>
              </div>
            )}
            
          </div>
        )}
      </motion.div>
    </div>
  );
}