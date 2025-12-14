'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Eye, CheckCircle, XCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ViewAllResidentRequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [residentRequests, setResidentRequests] = useState([]);
  const [residentRequestsLoading, setResidentRequestsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewInfoModal, setViewInfoModal] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }

    setUser(user);
    setRole(role);
    setLoading(false);

    fetchResidentRequests();
  }, [router]);

  const fetchResidentRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/superadmin/resident-requests', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch resident requests');
      
      const data = await response.json();
      
      // --- DEBUGGING LOG ---
      console.log("Fetched Resident Requests:", data); 
      // check your browser console (F12) to see if 'birthDate' exists in these objects
      // ---------------------

      setResidentRequests(data);
      if (data.length > 0) {
        setSelectedRequest(data[0]);
      }
    } catch (err) {
      console.error('Error fetching resident requests:', err);
    } finally {
      setResidentRequestsLoading(false);
    }
  };

  const filteredRequests = residentRequests.filter((request) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      request.firstName?.toLowerCase().includes(query) ||
      request.lastName?.toLowerCase().includes(query) ||
      request.middleName?.toLowerCase().includes(query) ||
      request.residentEmail?.toLowerCase().includes(query) ||
      request.phoneNumber?.toLowerCase().includes(query) ||
      request.address?.toLowerCase().includes(query)
    );
  });

  // HELPER: Format Date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      let date;
      if (dateString.includes('T')) {
        // Full datetime string
        date = new Date(dateString);
      } else {
        // Date only string (yyyy-MM-dd)
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      }
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleViewInfo = (request) => {
    setViewInfoModal(request);
  };

  const handleAccept = async (request) => {
    if (!confirm(`Are you sure you want to accept ${request.firstName} ${request.lastName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/superadmin/resident-requests/${request.residentId}/approve`, {
        method: 'PUT',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to approve');

      // Remove from resident requests and refresh
      setResidentRequests(residentRequests.filter(r => r.residentId !== request.residentId));
      if (selectedRequest?.residentId === request.residentId) {
        setSelectedRequest(null);
      }
      alert('Resident approved successfully');
    } catch (err) {
      alert('Error approving resident: ' + err.message);
    }
  };

  const handleReject = async (request) => {
    if (!confirm(`Are you sure you want to reject ${request.firstName} ${request.lastName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/superadmin/resident-requests/${request.residentId}/reject`, {
        method: 'PUT',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to reject');

      // Remove from resident requests
      setResidentRequests(residentRequests.filter(r => r.residentId !== request.residentId));
      if (selectedRequest?.residentId === request.residentId) {
        setSelectedRequest(null);
      }
      alert('Resident rejected successfully');
    } catch (err) {
      alert('Error rejecting resident: ' + err.message);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="pt-24 px-8 min-h-screen bg-[#FAFAFA] pb-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        className="mb-8 relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl -z-10"></div>
        <Link
          href="/superadmin/management"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 relative z-10"
        >
          <ArrowLeft size={16} />
          Back to Management
        </Link>
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Resident Requests</h1>
              <p className="text-gray-600">Review and manage pending resident applications</p>
            </div>
          </div>
        </div>
        <div className="w-full h-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mt-4 relative z-10"></div>
      </motion.div>

      {residentRequestsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resident requests...</p>
        </div>
      ) : (
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <motion.div
            className="w-80 bg-white rounded-xl shadow-md border border-gray-200 p-4 overflow-y-auto"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resident Requests ({filteredRequests.length})</h2>

            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Search by name, email, phone, or address
              </p>
            </div>

            <div className="space-y-2">
              {filteredRequests.map((request) => (
                <button
                  key={request.residentId}
                  onClick={() => setSelectedRequest(request)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedRequest?.residentId === request.residentId
                      ? 'bg-orange-50 border border-orange-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {request.firstName} {request.middleName} {request.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{request.residentEmail}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Details Panel */}
          <motion.div
            className="flex-1 bg-white rounded-xl shadow-md border border-gray-200 p-6 overflow-y-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            {selectedRequest ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedRequest.firstName} {selectedRequest.middleName} {selectedRequest.lastName}
                    </h2>
                    <p className="text-gray-600">Resident ID: {selectedRequest.residentId}</p>
                    <p className="text-sm text-orange-600 font-medium">Status: Pending Approval</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => handleViewInfo(selectedRequest)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Eye size={16} />
                      <span>View Info</span>
                    </button>
                    <button
                      onClick={() => handleAccept(selectedRequest)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                    >
                      <CheckCircle size={16} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedRequest.residentEmail}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">{selectedRequest.phoneNumber || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{selectedRequest.address || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Birthdate</p>
                      <p className="font-medium text-gray-900">
                        {/* Display Birthdate Here - Checks for 'birthDate' or 'birthdate' */}
                        {formatDate(selectedRequest.birthDate || selectedRequest.birthdate)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Valid ID</p>
                    {selectedRequest.validIdPath ? (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <img
                          src={`http://localhost:8080/${selectedRequest.validIdPath.replace(/\\/g, '/')}`}
                          alt="Valid ID"
                          className="w-full h-auto max-h-64 object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setExpandedImage(`http://localhost:8080/${selectedRequest.validIdPath.replace(/\\/g, '/')}`)}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="hidden text-center text-gray-500 py-4">
                          <div className="text-4xl mb-2">📄</div>
                          <p>Unable to load image</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">Click image to expand</p>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                        No ID uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Application Submitted</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedRequest.createdAt).toLocaleDateString()} at {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Select a resident request to view details</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* View Info Modal */}
      {viewInfoModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Resident Information</h3>
                  <p className="text-sm text-gray-600">
                    {viewInfoModal.firstName} {viewInfoModal.middleName} {viewInfoModal.lastName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewInfoModal.firstName} {viewInfoModal.middleName} {viewInfoModal.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{viewInfoModal.residentEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{viewInfoModal.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{viewInfoModal.address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Birthdate</label>
                    <p className="mt-1 text-sm text-gray-900">
                        {/* Display Birthdate Here - Checks for 'birthDate' or 'birthdate' */}
                        {formatDate(viewInfoModal.birthDate || viewInfoModal.birthdate)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valid ID</label>
                  {viewInfoModal.validIdPath ? (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <img
                        src={`http://localhost:8080/${viewInfoModal.validIdPath.replace(/\\/g, '/')}`}
                        alt="Valid ID"
                        className="w-full h-auto max-h-64 object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setExpandedImage(`http://localhost:8080/${viewInfoModal.validIdPath.replace(/\\/g, '/')}`)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-center text-gray-500 py-4">
                        <div className="text-4xl mb-2">📄</div>
                        <p>Unable to load image</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">Click image to expand</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                      No ID uploaded
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setViewInfoModal(null)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-12 right-0 text-gray-700 hover:text-gray-900 text-2xl font-bold z-60 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            >
              ✕
            </button>
            <img
              src={expandedImage}
              alt="Expanded ID"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={() => setExpandedImage(null)}
              style={{ cursor: 'zoom-out' }}
            />
            <p className="text-gray-700 text-center mt-4 text-sm opacity-75 bg-white px-3 py-1 rounded-full shadow-sm">
              Click image or ✕ to close
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}