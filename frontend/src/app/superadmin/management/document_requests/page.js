'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Search, MoreVertical, Eye } from 'lucide-react';
import NotificationModal from '@/app/components/NotificationModal';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import RequestDetailsModal from '@/app/components/RequestDetailsModal';
import { motion } from 'framer-motion';

export default function DocumentRequestsManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [buttonRect, setButtonRect] = useState(null);
  const itemsPerPage = 10;

  // Modals and states
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [notificationModal, setNotificationModal] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);

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

    fetchData();
  }, [router]);

  // Close dropdown when clicking anywhere on the screen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdownId]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:8080/api/superadmin/requests`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error(`Failed to fetch document requests`);
      let data = await response.json();

      // Filter document requests to show only pending ones
      data = data.filter(item => item.status === 'Pending');

      setData(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setCurrentPage(1);
    } catch (err) {
      console.error(`Error fetching document requests:`, err);
      setData([]);
      setTotalPages(1);
    } finally {
      setLoadingData(false);
    }
  };

  const handleManage = (item, event) => {
    event.preventDefault();
    event.stopPropagation();

    if (openDropdownId === item.requestId) {
      setOpenDropdownId(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const dropdownWidth = 192; // min-w-48 = 192px
      const viewportWidth = window.innerWidth;

      // Check if there's enough space on the right
      const spaceOnRight = viewportWidth - rect.right;
      let leftPosition;

      if (spaceOnRight >= dropdownWidth) {
        // Enough space on the right, position normally
        leftPosition = rect.left + window.scrollX;
      } else {
        // Not enough space on the right, position to the left
        leftPosition = rect.right - dropdownWidth + window.scrollX;
      }

      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: Math.max(8, leftPosition) // Ensure minimum 8px from left edge
      });
      setOpenDropdownId(item.requestId);
    }
  };

  const handleViewInfo = (resident) => {
    // Transform data structure for RequestDetailsModal compatibility
    const transformedResident = {
      ...resident,
      resident: resident.residentFullName && resident.residentFullName !== 'N/A' ? resident.residentFullName :
               (resident.residentFirstName && resident.residentLastName && resident.residentFirstName !== 'N/A' ?
                `${resident.residentFirstName} ${resident.residentLastName}` : 'Unknown Resident'),
      email: resident.residentEmail && resident.residentEmail !== 'N/A' ? resident.residentEmail : 'N/A'
    };
    setSelectedResident(transformedResident);
    setIsViewDetailsModalOpen(true);
  };

  const handleAccept = (item) => {
    const residentName = item.residentFullName && item.residentFullName !== 'N/A' ? item.residentFullName : (item.residentFirstName && item.residentLastName && item.residentFirstName !== 'N/A' ? `${item.residentFirstName} ${item.residentLastName}` : 'Unknown Resident');
    setConfirmationModal({
      type: 'approve',
      title: 'Confirm Approval',
      message: `Are you sure you want to approve this document request for ${residentName}?`,
      confirmText: 'Approve',
      confirmButtonClass: 'bg-green-600 hover:bg-green-700',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/superadmin/requests/${item.requestId}/approve`, {
            method: 'PUT',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to approve');

          // Refresh data
          fetchData();
          setNotificationModal({
            type: 'success',
            title: 'Document Request Approved',
            message: 'Document request has been approved successfully',
            autoClose: true,
            autoCloseDelay: 3000
          });
        } catch (err) {
          setNotificationModal({
            type: 'error',
            title: 'Approval Failed',
            message: 'Error approving: ' + err.message
          });
        }
      }
    });
  };

  const handleReject = (item) => {
    const residentName = item.residentFullName && item.residentFullName !== 'N/A' ? item.residentFullName : (item.residentFirstName && item.residentLastName && item.residentFirstName !== 'N/A' ? `${item.residentFirstName} ${item.residentLastName}` : 'Unknown Resident');
    const feedback = prompt(`Please provide feedback for rejecting the document request for ${residentName}:`);
    if (feedback === null) return; // User cancelled

    setConfirmationModal({
      type: 'reject',
      title: 'Confirm Rejection',
      message: `Are you sure you want to reject this document request?`,
      confirmText: 'Reject',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/superadmin/requests/${item.requestId}/reject`, {
            method: 'PUT',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to reject');

          fetchData();
          setNotificationModal({
            type: 'success',
            title: 'Document Request Rejected',
            message: 'Document request has been rejected successfully',
            autoClose: true,
            autoCloseDelay: 3000
          });
          setOpenDropdownId(null);
        } catch (err) {
          setNotificationModal({
            type: 'error',
            title: 'Rejection Failed',
            message: 'Error rejecting: ' + err.message
          });
        }
      }
    });
  };

  if (!user || loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading document requests management...</p>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Requests Management</h1>
          <p className="text-gray-600">Review and manage pending document requests</p>
        </motion.div>

        {/* Content Area */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          {/* Header with Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Document Requests
                </h2>
                <span className="text-sm text-gray-500">
                  {data.length} total
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          {loadingData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading document requests...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resident
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data
                      .filter((item) => {
                        if (!searchQuery.trim()) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                          item.residentFirstName?.toLowerCase().includes(query) ||
                          item.residentLastName?.toLowerCase().includes(query) ||
                          item.documentName?.toLowerCase().includes(query)
                        );
                      })
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((item, index) => (
                        <tr key={`document-request-${item.requestId}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.residentFullName && item.residentFullName !== 'N/A' ? item.residentFullName : (item.residentFirstName && item.residentLastName && item.residentFirstName !== 'N/A' ? `${item.residentFirstName} ${item.residentLastName}` : 'Unknown Resident')}
                                </div>
                                <div className="text-sm text-gray-500">{item.residentEmail && item.residentEmail !== 'N/A' ? `@${item.residentEmail}` : 'No email'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.documentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="relative">
                              <button
                                onClick={(e) => handleManage(item, e)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Floating Dropdown */}
              {openDropdownId && (
                <div
                  className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-48 z-20"
                  style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {(() => {
                    const item = data.find(d => d.requestId === openDropdownId);
                    if (!item) return null;

                    return (
                      <div className="space-y-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInfo(item);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(item);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(item);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * itemsPerPage, data.length)}</span> of{' '}
                        <span className="font-medium">{data.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal
        isOpen={isViewDetailsModalOpen}
        onClose={() => setIsViewDetailsModalOpen(false)}
        requestDetails={selectedResident}
        onApprove={(requestId) => {
          const item = data.find(d => d.requestId === requestId);
          if (item) handleAccept(item);
        }}
        onReject={(requestId) => {
          const item = data.find(d => d.requestId === requestId);
          if (item) handleReject(item);
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

      <ConfirmationModal
        isOpen={!!confirmationModal}
        onClose={() => setConfirmationModal(null)}
        onConfirm={confirmationModal?.onConfirm}
        type={confirmationModal?.type}
        title={confirmationModal?.title}
        message={confirmationModal?.message}
        confirmText={confirmationModal?.confirmText}
        cancelText={confirmationModal?.cancelText}
        confirmButtonClass={confirmationModal?.confirmButtonClass}
      />
    </motion.div>
  );
}