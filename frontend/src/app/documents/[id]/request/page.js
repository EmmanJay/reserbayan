'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, X, File } from 'lucide-react'; // Added icons
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import PendingRestrictionModal from '@/app/components/PendingRestrictionModal';
import RejectedResubmitModal from '@/app/components/RejectedResubmitModal';
import NotificationModal from '@/app/components/NotificationModal';

export default function RequestDocumentPage() {
  const router = useRouter();
  const { id } = useParams();
  const { documentsData, loading: docsLoading, error: docsError } = useDocumentTypes();

  const document = documentsData.find((doc) => doc.id === id);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    purpose: '',
  });
  
  // New state for files
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      setNotificationModal({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login first to request documents.'
      });
      window.dispatchEvent(new CustomEvent('showLogin'));
      setLoading(false);
      return;
    }

    setUser(storedUser);

    const userType = localStorage.getItem('userType');
    if (userType === 'resident') {
      setFormData({
        fullName: `${storedUser.firstName} ${storedUser.middleName || ''} ${storedUser.lastName}`.trim(),
        email: storedUser.residentEmail,
        phone: storedUser.phoneNumber,
        address: storedUser.address,
        purpose: '',
      });
    }

    setLoading(false);
  }, []);

  if (docsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (docsError || !document) {
    return <p className="text-center text-red-600 mt-10">Document not found.</p>;
  }

  if (loading || !user) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle File Selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Add new files to existing ones
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  // Remove a selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setNotificationModal({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login first to request documents.'
      });
      window.dispatchEvent(new CustomEvent('showLogin'));
      return;
    }

    if (user.status === 'PENDING') {
      setShowPendingModal(true);
      return;
    }

    if (user.status === 'REJECTED') {
      setShowRejectedModal(true);
      return;
    }

    // --- PREPARE FORM DATA FOR UPLOAD ---
    const dataPayload = {
      documentId: id,
      documentName: document.name,
      residentId: user.residentId,
      details: formData.purpose,
    };

    const formDataToSend = new FormData();
    // 1. Append the JSON data as a string
    formDataToSend.append('data', JSON.stringify(dataPayload));
    
    // 2. Append each file
    selectedFiles.forEach(file => {
        formDataToSend.append('files', file);
    });

    const token = localStorage.getItem('token');
    if (!token) {
      setNotificationModal({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login first to request documents.'
      });
      return;
    }

    // NOTE: Do NOT set 'Content-Type': 'application/json' here.
    // The browser automatically sets it to multipart/form-data with the boundary.
    const response = await fetch('http://localhost:8080/api/document-requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formDataToSend,
    });

    if (response.ok) {
      setNotificationModal({
        type: 'success',
        title: 'Request Submitted',
        message: 'Your document request has been submitted successfully!',
        autoClose: true,
        autoCloseDelay: 3000
      });
      setTimeout(() => router.push('/requests'), 3000);
    } else {
      const error = await response.text();
      setNotificationModal({
        type: 'error',
        title: 'Request Failed',
        message: 'Error: ' + error
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="font-montserrat font-extrabold text-4xl text-blue-900 mb-4">
        Request: {document.name}
      </h1>

      <p className="text-gray-600 mb-6">
        Please fill out the form below to request this document.  
        Fields marked with <span className="text-red-500">*</span> are required.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 rounded-lg shadow-md border"
      >
        {/* Full Name */}
        <div>
          <label className="block mb-2 font-medium" htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-2 font-medium" htmlFor="email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-2 font-medium" htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block mb-2 font-medium" htmlFor="address">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            name="address"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        {/* Purpose */}
        <div>
          <label className="block mb-2 font-medium" htmlFor="purpose">
            Purpose of Request <span className="text-red-500">*</span>
          </label>
          <textarea
            id="purpose"
            name="purpose"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
            value={formData.purpose}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* --- UPLOAD REQUIREMENTS SECTION --- */}
        <div>
          <label className="block mb-2 font-medium">
            Upload Requirements (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
             <div className="flex flex-col items-center justify-center">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label 
                   htmlFor="file-upload" 
                   className="cursor-pointer flex flex-col items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                   <Upload className="w-8 h-8" />
                   <span className="text-sm font-medium">Click to upload files</span>
                   <span className="text-xs text-gray-400">Supported: Images, PDF</span>
                </label>
             </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
               {selectedFiles.map((file, index) => (
                 <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded-md border border-blue-100">
                    <div className="flex items-center gap-2 overflow-hidden">
                       <File className="w-4 h-4 text-blue-500 flex-shrink-0" />
                       <span className="text-sm text-gray-700 truncate">{file.name}</span>
                       <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                       <X className="w-4 h-4" />
                    </button>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Submit Request
        </button>
      </form>

      {/* Pending Restriction Modal */}
      <PendingRestrictionModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
      />

      {/* Rejected Resubmit Modal */}
      <RejectedResubmitModal
        isOpen={showRejectedModal}
        onClose={() => setShowRejectedModal(false)}
        onResubmit={() => {
          setShowRejectedModal(false);
          router.push('/dashboard?openActivity=true');
        }}
      />

      <NotificationModal
        isOpen={!!notificationModal}
        onClose={() => setNotificationModal(null)}
        type={notificationModal?.type}
        title={notificationModal?.title}
        message={notificationModal?.message}
        autoClose={notificationModal?.autoClose}
        autoCloseDelay={notificationModal?.autoCloseDelay}
      />
    </div>
  );
}