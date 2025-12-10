'use client';

import { useEffect, useState, useCallback } from 'react';
import RequestsList from '@/components/requests/RequestsList';
import RequestModal from '@/components/requests/RequestModal';

export default function SuperAdminNotificationsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchAllRequests = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      console.error('No token found');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/document-requests', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error('Failed to fetch all requests:', res.status, res.statusText);
        alert('Failed to load requests. Please try again.');
        setRequests([]);
      } else {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Network error fetching all requests:', err);
      alert('Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const handleRequestClick = (req) => setSelectedRequest(req);
  const closeModal = () => setSelectedRequest(null);

  return (
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900">Superadmin Notifications</h1>
          <p className="text-gray-600">Latest document requests from residents</p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">No document requests found.</div>
        ) : (
          <RequestsList requests={requests} onRequestClick={handleRequestClick} />
        )}

        {selectedRequest && (
          <RequestModal
            request={selectedRequest}
            user={null}
            onClose={() => {
              closeModal();
              fetchAllRequests(); // Refresh the list after modal closes
            }}
            cancelRequest={async () => ({ success: false, error: 'Not supported in admin view' })}
          />
        )}
      </div>
  );
}
