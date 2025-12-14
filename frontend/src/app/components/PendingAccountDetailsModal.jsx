'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, Clock, Loader2, Eye } from 'lucide-react';
import { useState } from 'react';

export default function PendingAccountDetailsModal({
  isOpen,
  onClose,
  accountDetails,
  onApprove,
  onReject,
  loading = false,
  actionLoading = { approve: false, reject: false, accountId: null }
}) {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  if (!isOpen || !accountDetails) return null;

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

  // FIX 1: Check against residentId, not id
  const isApproveLoading = actionLoading.approve && actionLoading.accountId === accountDetails.residentId;
  const isRejectLoading = actionLoading.reject && actionLoading.accountId === accountDetails.residentId;

  const handleApprove = async () => {
    if (onApprove && !loading && !isApproveLoading) {
      // FIX 2: Pass residentId, not id
      await onApprove(accountDetails.residentId);
    }
  };

  const handleReject = async () => {
    if (onReject && !loading && !isRejectLoading) {
      // FIX 3: Pass residentId, not id
      await onReject(accountDetails.residentId);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading && !isApproveLoading && !isRejectLoading) {
      onClose();
    }
  };

  const handleImageClick = () => {
    setIsImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  const handleImageViewerBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseImageViewer();
    }
  };

  const handleImageViewerModalClick = (e) => {
    // Prevent closing when clicking inside the modal content
    e.stopPropagation();
  };

  return (
    <>
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
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pending Account Details</h2>
                  <p className="text-sm text-slate-600">Review and manage resident registration</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                disabled={loading || isApproveLoading || isRejectLoading}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="ml-3 text-slate-600">Loading account details...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center font-bold text-xl text-[#1E2566]">
                      {accountDetails.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {accountDetails.firstName} {accountDetails.middleName && accountDetails.middleName + ' '}{accountDetails.lastName}
                      </h3>
                      <p className="text-blue-100 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {accountDetails.residentEmail}
                      </p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 mt-2">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Approval
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">First Name</label>
                        <p className="text-sm font-medium text-slate-900">{accountDetails.firstName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Middle Name</label>
                        <p className="text-sm font-medium text-slate-900">{accountDetails.middleName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Name</label>
                        <p className="text-sm font-medium text-slate-900">{accountDetails.lastName || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</label>
                        <p className="text-sm font-medium text-slate-900">{accountDetails.residentEmail || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone Number</label>
                        <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {accountDetails.phoneNumber || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Region</label>
                        <p className="text-sm font-medium text-slate-900">{accountDetails.region || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Province</label>
                        <p className="text-sm font-medium text-slate-900">{accountDetails.province || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">City/Municipality</label>
                        <p className="text-sm font-medium text-slate-900">{accountDetails.city || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Barangay</label>
                        <p className="text-sm font-medium text-slate-900">{accountDetails.barangay || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Sitio</label>
                        <p className="text-sm font-medium text-slate-900">{accountDetails.sitio || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address Line</label>
                        <p className="text-sm font-medium text-slate-900">{accountDetails.addressLine1 || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Valid ID Document - Secure Viewing Section */}
                {accountDetails.validIdPath ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Valid ID Document
                    </h4>
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-300 transition-colors" onClick={handleImageClick}>
                        <img
                          src={accountDetails.validIdPath.startsWith('http')
                            ? accountDetails.validIdPath
                            : `http://localhost:8080/${accountDetails.validIdPath.replace(/\\/g, '/')}`
                          }
                          alt="Valid ID Document"
                          className="w-full h-auto max-h-96 object-contain bg-slate-50 hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.target.src = '/documents/no-preview.png';
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-amber-600" />
                          <p className="text-sm text-amber-800 font-medium">
                            For Review Only - No Download
                          </p>
                        </div>
                        <button
                          onClick={handleImageClick}
                          className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700 transition-colors"
                        >
                          View Full Size
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                        Click on the image to view full size. Document viewing is logged for security purposes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Valid ID Document
                    </h4>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No valid ID document uploaded</p>
                      <p className="text-sm text-slate-400 mt-2">
                        This resident did not upload a valid ID during registration.
                      </p>
                    </div>
                  </div>
                )}

                {/* Registration Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Registration Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Registration Date</label>
                      <p className="text-sm font-medium text-slate-900">
                        {accountDetails.createdAt ? formatDate(accountDetails.createdAt) : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Registration Time</label>
                      <p className="text-sm font-medium text-slate-900">
                        {accountDetails.createdAt ? formatTime(accountDetails.createdAt) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!loading && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={handleReject}
                disabled={isApproveLoading || isRejectLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isRejectLoading
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isRejectLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                {isRejectLoading ? 'Rejecting...' : 'Reject Account'}
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproveLoading || isRejectLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isApproveLoading
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isApproveLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {isApproveLoading ? 'Approving...' : 'Approve Account'}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Secure Image Viewer Modal */}
      <AnimatePresence>
        {isImageViewerOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={handleImageViewerBackdropClick}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleImageViewerBackdropClick}
            />

            {/* Image Viewer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-auto overflow-hidden"
              onClick={handleImageViewerModalClick}
            >
              {/* Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Valid ID Document - Secure Review</h3>
                  <p className="text-xs text-slate-600 mt-1">This document is for verification purposes only</p>
                </div>
                <button
                  onClick={handleCloseImageViewer}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Security Notice */}
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    <strong>Security Notice:</strong> This document contains sensitive personal information.
                    Viewing is logged for audit purposes. Do not screenshot or share this document.
                  </p>
                </div>
              </div>

              {/* Image Content */}
              <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
                <img
                  src={accountDetails.validIdPath.startsWith('http')
                    ? accountDetails.validIdPath
                    : `http://localhost:8080/${accountDetails.validIdPath.replace(/\\/g, '/')}`
                  }
                  alt="Valid ID Document - Full Size"
                  className="w-full h-auto object-contain bg-slate-50 rounded-lg"
                  onError={(e) => {
                    e.target.src = '/documents/no-preview.png';
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}