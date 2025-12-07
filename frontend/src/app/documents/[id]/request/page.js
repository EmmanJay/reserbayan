'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import PendingRestrictionModal from '@/components/PendingRestrictionModal';
import NotificationModal from '@/components/NotificationModal';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPendingModal, setShowPendingModal] = useState(false);
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
    // Hide form for non-logged-in users
    return null;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
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

    const payload = {
      documentId: id,
      documentName: document.name,
      residentId: user.residentId,
      details: formData.purpose,
    };

    const token = localStorage.getItem('token');
    if (!token) {
      setNotificationModal({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login first to request documents.'
      });
      window.dispatchEvent(new CustomEvent('showLogin'));
      return;
    }

    const response = await fetch('http://localhost:8080/api/document-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
