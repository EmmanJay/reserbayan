'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      alert('Please login first');
      window.dispatchEvent(new CustomEvent('showLogin'));
      setLoading(false);
      return;
    }

    setUser(storedUser);

    const fetchRequests = async () => {
      try {
        console.log('Fetching requests for residentId:', storedUser.residentId);
        const response = await fetch(`http://localhost:8080/api/document-requests/resident/${storedUser.residentId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched requests:', data);
          setRequests(data);
        } else {
          console.error('Failed to fetch requests:', response.status, response.statusText);
          alert('Failed to load requests. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        alert('Network error. Please check if the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusIcon = (status) => {
    const statusLower = status ? status.toLowerCase() : '';
    switch (statusLower) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status ? status.toLowerCase() : '';
    switch (statusLower) {
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'rejected':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] pb-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-montserrat font-extrabold text-4xl text-blue-900 mb-8 text-center">
          My Document Requests
        </h1>

        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Requests Yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't submitted any document requests yet.
            </p>
            <button
              onClick={() => router.push('/documents')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse Documents
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.requestId}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <h3 className="font-montserrat font-bold text-lg text-blue-900">
                        {request.documentName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusIcon(request.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Submitted on {new Date(request.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="text-gray-700">
                      <p className="text-sm font-medium mb-1">Purpose:</p>
                      <p className="text-sm bg-gray-50 p-3 rounded-md">{request.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}