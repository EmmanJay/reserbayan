'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Shield, Eye, Settings, Trash2, Key, Plus, CheckCircle, XCircle, Search, MoreVertical, Edit, EyeOff, Crown, UserX, FileText, AlertTriangle } from 'lucide-react';
import NotificationModal from '@/app/components/NotificationModal';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import ViewDetailsModal from '@/app/components/ViewDetailsModal';
import RequestDetailsModal from '@/app/components/RequestDetailsModal';
import RejectionReasonModal from '@/app/components/RejectionReasonModal';
import { motion } from 'framer-motion';

import Link from 'next/link';

// Helper function to get proper CSS classes for active tabs
const getActiveTabStyles = (color) => {
  const styles = {
    blue: 'bg-blue-100 text-blue-700 border border-blue-200',
    green: 'bg-green-100 text-green-700 border border-green-200',
    orange: 'bg-orange-100 text-orange-700 border border-orange-200',
    purple: 'bg-purple-100 text-purple-700 border border-purple-200',
  };
  return styles[color] || 'bg-gray-100 text-gray-700 border border-gray-200';
};

export default function AdminManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('residents');
  const [data, setData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [buttonRect, setButtonRect] = useState(null);
  const [sitioFilter, setSitioFilter] = useState('');
  const [availableSitios, setAvailableSitios] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const itemsPerPage = 10;

  // Modals and states
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [viewInfoModal, setViewInfoModal] = useState(null);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [notificationModal, setNotificationModal] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [rejectionLoading, setRejectionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    setUser(user);
    setRole(role);
    setLoading(false);

    // Determine initial tab from URL or set default
    const tabParam = searchParams.get('tab');
    let initialTab;
    
    if (tabParam && ['residents', 'resident-requests', 'document-requests'].includes(tabParam)) {
      initialTab = tabParam;
    } else if (role === 'SUPER_ADMIN') {
      // Super admin default to administrators tab
      initialTab = 'administrators';
    } else {
      // Admin default to residents tab
      initialTab = 'residents';
    }
    
    setActiveTab(initialTab);
    fetchData(initialTab);
  }, [router, searchParams]);

  // Handle URL parameter changes for tab switching
  useEffect(() => {
    if (!loading) {
      const tabParam = searchParams.get('tab');
      if (tabParam && ['residents', 'resident-requests', 'document-requests'].includes(tabParam)) {
        if (activeTab !== tabParam) {
          setActiveTab(tabParam);
        }
        fetchData(tabParam);
      }
    }
  }, [searchParams, loading]);

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

  const fetchData = async (tab) => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      switch (tab) {
        case 'residents':
          endpoint = 'residents';
          break;
        case 'resident-requests':
          endpoint = 'resident-requests';
          break;
        case 'document-requests':
          endpoint = 'requests';
          break;
        default:
          endpoint = 'residents';
      }

      const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error(`Failed to fetch ${tab}`);
      let data = await response.json();

      // Extract unique sitios for residents tab
      if (tab === 'residents') {
        const uniqueSitios = [...new Set(data.map(item => item.sitio).filter(sitio => sitio && sitio.trim() !== ''))].sort();
        setAvailableSitios(uniqueSitios);
      } else {
        setAvailableSitios([]);
        setSitioFilter('');
      }

      // Clear document request filters when not on document-requests tab
      if (tab !== 'document-requests') {
        setStatusFilter('');
        setSortOrder('asc');
      }

      setData(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setCurrentPage(1);
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
      setData([]);
      setTotalPages(1);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSitioFilter('');
    setStatusFilter('');
    setSortOrder('asc');
    setCurrentPage(1);
    setOpenDropdownId(null);
    
    // Update URL to reflect the current tab using Next.js router
    const newUrl = tab === 'residents' ? '/admin/management' : `/admin/management?tab=${tab}`;
    router.push(newUrl, { scroll: false });
  };

  const handleManage = (type, item, event) => {
    event.preventDefault();
    event.stopPropagation();

    const dropdownId = activeTab === 'document-requests' ? item.requestId : item.residentId;

    if (openDropdownId === dropdownId) {
      setOpenDropdownId(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const dropdownWidth = 192;
      const viewportWidth = window.innerWidth;

      const spaceOnRight = viewportWidth - rect.right;
      let leftPosition;

      if (spaceOnRight >= dropdownWidth) {
        leftPosition = rect.left + window.scrollX;
      } else {
        leftPosition = rect.right - dropdownWidth + window.scrollX;
      }

      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: Math.max(8, leftPosition)
      });
      setOpenDropdownId(dropdownId);
    }
  };

  const handleDropdownClick = (e, itemId) => {
    e.stopPropagation();
    if (openDropdownId === itemId) {
        setOpenDropdownId(null);
        setButtonRect(null);
    } else {
        setOpenDropdownId(itemId);
        setButtonRect(e.currentTarget.getBoundingClientRect());
    }
  };

  const handleDelete = (item) => {
    const entityType = activeTab === 'residents' ? 'resident' : 'request';

    setConfirmationModal({
      type: 'delete',
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${entityType}? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        const endpoint = activeTab === 'residents' ? 'residents' : 'resident-requests';

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}/${item.residentId}`, {
            method: 'DELETE',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to delete');

          fetchData(activeTab);

          setNotificationModal({
            type: 'success',
            title: 'Deletion Successful',
            message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} deleted successfully`,
            autoClose: true,
            autoCloseDelay: 3000
          });
        } catch (err) {
          setNotificationModal({
            type: 'error',
            title: 'Deletion Failed',
            message: 'Error deleting: ' + err.message
          });
        }
      }
    });
  };

  const handlePasswordReset = async (item) => {
    const newPassword = prompt(`Enter new password for ${item.firstName} ${item.lastName}:`);
    if (!newPassword) return;

    const endpoint = 'residents';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}/${item.residentId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!response.ok) throw new Error('Failed to reset password');

      setNotificationModal({
        type: 'success',
        title: 'Password Reset Successful',
        message: 'Password has been reset successfully',
        autoClose: true,
        autoCloseDelay: 3000
      });
    } catch (err) {
      setNotificationModal({
        type: 'error',
        title: 'Password Reset Failed',
        message: 'Error resetting password: ' + err.message
      });
    }
  };

  const handleViewInfo = (resident) => {
    // Transform data structure for RequestDetailsModal compatibility
    let transformedResident = resident;
    if (activeTab === 'document-requests') {
      // Convert nested resident object to string format expected by RequestDetailsModal
      const fullName = `${resident.resident?.firstName || ''} ${resident.resident?.lastName || ''}`.trim();
      transformedResident = {
        ...resident,
        resident: fullName || 'Unknown Resident',
        email: resident.resident?.email || resident.residentEmail || 'N/A'
      };
    }
    setSelectedResident(transformedResident);
    setModalType(activeTab);
    setIsViewDetailsModalOpen(true);
  };

  const handleAccept = (item) => {
    const entityType = activeTab === 'resident-requests' ? 'resident' : 'document request';
    const endpoint = activeTab === 'resident-requests' ? 'resident-requests' : 'requests';
    
    const itemId = activeTab === 'resident-requests' ? item.residentId : item.requestId;
    
    let displayName = 'Unknown';
    if (activeTab === 'resident-requests') {
      displayName = [item.firstName, item.lastName].filter(name => name && name.trim()).join(' ').trim() || 'Unknown Resident';
    } else if (activeTab === 'document-requests') {
      displayName = item.resident ?
        [item.resident.firstName, item.resident.lastName].filter(name => name && name.trim()).join(' ').trim() || 'Unknown Resident' :
        'Unknown Resident';
    }

    setConfirmationModal({
      type: 'approve',
      title: 'Confirm Approval',
      message: `Are you sure you want to approve ${displayName}? This will grant them full access to request documents.`,
      confirmText: 'Approve',
      confirmButtonClass: 'bg-green-600 hover:bg-green-700',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}/${itemId}/approve`, {
            method: 'PUT',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to approve');

          fetchData(activeTab);
          setNotificationModal({
            type: 'success',
            title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Approved`,
            message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} has been approved successfully`,
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
    
    setIsViewDetailsModalOpen(false);
  };

  const handleReject = (item) => {
    const entityType = activeTab === 'resident-requests' ? 'resident registration' : 'document request';
    
    let displayName = 'Unknown';
    if (activeTab === 'resident-requests') {
      displayName = [item.firstName, item.lastName].filter(name => name && name.trim()).join(' ').trim() || 'Unknown Resident';
    } else if (activeTab === 'document-requests') {
      displayName = item.resident ?
        [item.resident.firstName, item.resident.lastName].filter(name => name && name.trim()).join(' ').trim() || 'Unknown Resident' :
        'Unknown Resident';
    }

    setRejectionModal({
      item: item,
      title: `Reject ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`,
      itemName: displayName
    });

    setIsViewDetailsModalOpen(false);
    setOpenDropdownId(null);
  };

  const handleCompleteDocument = async (item) => {
    const displayName = item.resident ?
      [item.resident.firstName, item.resident.lastName].filter(name => name && name.trim()).join(' ').trim() || 'Unknown Resident' :
      'Unknown Resident';

    setConfirmationModal({
      type: 'complete',
      title: 'Confirm Document Completion',
      message: `Are you sure you want to mark the document request for ${displayName} as completed? This indicates the document has been claimed.`,
      confirmText: 'Mark as Completed',
      confirmButtonClass: 'bg-blue-600 hover:bg-blue-700',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/superadmin/requests/${item.requestId}/complete`, {
            method: 'PUT',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to complete document request');

          fetchData(activeTab);
          setNotificationModal({
            type: 'success',
            title: 'Document Request Completed',
            message: 'Document request has been marked as completed successfully',
            autoClose: true,
            autoCloseDelay: 3000
          });
        } catch (err) {
          setNotificationModal({
            type: 'error',
            title: 'Completion Failed',
            message: 'Error completing document request: ' + err.message
          });
        }
      }
    });
  };

  const handleRejectionSubmit = async (rejectionReason) => {
    if (!rejectionModal || rejectionLoading) return;

    setRejectionLoading(true);
    
    const entityType = activeTab === 'resident-requests' ? 'resident registration' : 'document request';
    const endpoint = activeTab === 'resident-requests' ? 'resident-requests' : 'requests';
    
    const itemId = activeTab === 'resident-requests' ? rejectionModal.item.residentId : rejectionModal.item.requestId;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}/${itemId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rejectionReason: rejectionReason })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject');
      }

      fetchData(activeTab);
      
      setNotificationModal({
        type: 'success',
        title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Rejected`,
        message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} has been rejected successfully`,
        autoClose: true,
        autoCloseDelay: 3000
      });
      
      setRejectionModal(null);
    } catch (err) {
      setNotificationModal({
        type: 'error',
        title: 'Rejection Failed',
        message: 'Error rejecting: ' + err.message
      });
    } finally {
      setRejectionLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading management panel...</p>
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
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <div className="flex space-x-1">
            {[
              ...(role === 'SUPER_ADMIN' ? [{ id: 'administrators', label: 'Administrators', icon: Shield, color: 'blue' }] : []),
              { id: 'residents', label: 'Residents', icon: Users, color: 'green' },
              ...(role === 'SUPER_ADMIN' ? [{ id: 'resident-requests', label: 'Pending Accounts', icon: Users, color: 'orange' }] : []),
              { id: 'document-requests', label: 'Document Requests', icon: FileText, color: 'purple' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? getActiveTabStyles(tab.color)
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'administrators' && 'Administrators'}
                {activeTab === 'residents' && 'Residents'}
                {activeTab === 'resident-requests' && 'Resident Requests'}
                {activeTab === 'document-requests' && 'Document Requests'}
              </h2>
              <span className="text-sm text-gray-500">
                {data.length} total
              </span>
            </div>
            <div className="flex items-center gap-4">
              {activeTab === 'document-requests' && (
                <>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="asc">Name A-Z</option>
                    <option value="desc">Name Z-A</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                  </select>
                </>
              )}
              {activeTab === 'residents' && availableSitios.length > 0 && (
                <select
                  value={sitioFilter}
                  onChange={(e) => setSitioFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">All Sitios</option>
                  {availableSitios.map((sitio) => (
                    <option key={sitio} value={sitio}>
                      {sitio}
                    </option>
                  ))}
                </select>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'document-requests' ? 'Resident' : 'Name'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'document-requests' ? 'Document' : 'Email'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'document-requests' ? 'Date' : 'Phone'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'administrators' ? 'Role' : activeTab === 'residents' ? 'Sitio' : 'Status'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data
                    .filter((item) => {
                      // Apply sitio filter if residents tab and sitio filter is selected
                      if (activeTab === 'residents' && sitioFilter && sitioFilter.trim() !== '') {
                        if (item.sitio !== sitioFilter) return false;
                      }

                      // Apply status filter if document-requests tab and status filter is selected
                      if (activeTab === 'document-requests' && statusFilter && statusFilter.trim() !== '') {
                        if (item.status !== statusFilter) return false;
                      }

                      // Apply search query filter
                      if (!searchQuery.trim()) return true;
                      const query = searchQuery.toLowerCase();
                      return (
                        item.firstName?.toLowerCase().includes(query) ||
                        item.lastName?.toLowerCase().includes(query) ||
                        item.middleName?.toLowerCase().includes(query) ||
                        item.residentEmail?.toLowerCase().includes(query) ||
                        item.phoneNumber?.toLowerCase().includes(query) ||
                        item.sitio?.toLowerCase().includes(query) ||
                        item.documentName?.toLowerCase().includes(query) ||
                        item.resident?.firstName?.toLowerCase().includes(query) ||
                        item.resident?.lastName?.toLowerCase().includes(query)
                      );
                    })
                    .sort((a, b) => {
                      // Apply sorting for document requests
                      if (activeTab === 'document-requests') {
                        const nameA = `${a.resident?.firstName || ''} ${a.resident?.lastName || ''}`.toLowerCase();
                        const nameB = `${b.resident?.firstName || ''} ${b.resident?.lastName || ''}`.toLowerCase();
                        if (sortOrder === 'asc') {
                          return nameA.localeCompare(nameB);
                        } else {
                          return nameB.localeCompare(nameA);
                        }
                      }
                      // Default sorting for other tabs
                      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
                      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
                      if (sortOrder === 'asc') {
                        return nameA.localeCompare(nameB);
                      } else {
                        return nameB.localeCompare(nameA);
                      }
                    })
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item, index) => (
                      <tr
                        key={`${activeTab}-${item.requestId || item.residentId}-${index}`}
                        onClick={() => handleViewInfo(item)}
                        className="hover:bg-gray-100 cursor-pointer transition-colors"
                        role="row"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewInfo(item); } }}
                        aria-label={`View details for ${activeTab === 'document-requests' ? item.documentName : [item.firstName, item.lastName].filter(n => n).join(' ')}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                activeTab === 'administrators' ? 'bg-purple-100' :
                                activeTab === 'residents' ? 'bg-blue-100' :
                                activeTab === 'resident-requests' ? 'bg-orange-100' : 'bg-green-100'
                              }`}>
                                {activeTab === 'administrators' ? (
                                  <Shield className="h-5 w-5 text-purple-600" />
                                ) : activeTab === 'residents' ? (
                                  <Users className="h-5 w-5 text-blue-600" />
                                ) : activeTab === 'resident-requests' ? (
                                  <Users className="h-5 w-5 text-orange-600" />
                                ) : (
                                  <FileText className="h-5 w-5 text-green-600" />
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {activeTab === 'document-requests' ? `${item.resident?.firstName || ''} ${item.resident?.lastName || ''}`.trim() || 'N/A' : [item.firstName, item.middleName, item.lastName].filter(name => name && name.trim()).join(' ').trim() || 'N/A'}
                              </div>
                              {item.username && activeTab !== 'document-requests' && (
                                <div className="text-sm text-gray-500">@{item.username}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activeTab === 'document-requests' ? item.documentName : item.residentEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {activeTab === 'document-requests' ? (item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'N/A') : item.phoneNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activeTab === 'administrators' ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {item.role || 'N/A'}
                            </span>
                          ) : activeTab === 'residents' ? (
                            <span className="text-sm text-gray-900">
                              {item.sitio || 'N/A'}
                            </span>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              // Using a temporary variable to normalize status case for simpler check
                              ['COMPLETED', 'Completed'].includes(item.status) ? 'bg-green-100 text-green-800' :
                              ['PENDING', 'Pending'].includes(item.status) ? 'bg-yellow-100 text-yellow-800' :
                              ['APPROVED', 'Approved'].includes(item.status) ? 'bg-blue-100 text-blue-800' :
                              ['REJECTED', 'Rejected'].includes(item.status) ? 'bg-red-100 text-red-800' :
                              ['CANCELLED', 'Cancelled'].includes(item.status) ? 'bg-gray-200 text-gray-800' :
                              'bg-gray-100 text-gray-800' // General fallback (e.g., if status is undefined)
                            }`}>
                              {item.status || 'N/A'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={(e) => handleManage(
                                activeTab === 'administrators' ? 'admin' :
                                activeTab === 'residents' ? 'resident' :
                                activeTab === 'resident-requests' ? 'request' : 'document',
                                item,
                                e
                              )}
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
                    const item = data.find(d => (activeTab === 'document-requests' ? d.requestId : d.residentId) === openDropdownId);
                    if (!item) return null;

                    return (
                      <div className="space-y-1">
                        {activeTab === 'residents' && (
                          <>
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
                                handlePasswordReset(item);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                            >
                              <Key size={16} />
                              Reset Password
                            </button>
                          </>
                        )}
                        {activeTab === 'resident-requests' && (
                          <>
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
                              className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded flex items-center gap-2"
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
                              className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded flex items-center gap-2"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </>
                        )}
                        {activeTab === 'document-requests' && (
                          <>
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
                            {item.status === 'Pending' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAccept(item);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded flex items-center gap-2"
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
                                  className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded flex items-center gap-2"
                                >
                                  <XCircle size={16} />
                                  Reject
                                </button>
                              </>
                            )}
                            {item.status === 'Approved' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteDocument(item);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded flex items-center gap-2"
                              >
                                <CheckCircle size={16} />
                                Complete
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    );
                  })()}
                </div>
            )}

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
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
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
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Conditional Modal Rendering */}
      {modalType === 'document-requests' ? (
        <RequestDetailsModal
          isOpen={isViewDetailsModalOpen}
          onClose={() => setIsViewDetailsModalOpen(false)}
          requestDetails={selectedResident}
          onApprove={selectedResident?.status === 'Pending' ? (requestId) => {
            const item = data.find(d => d.requestId === requestId);
            if (item) handleAccept(item);
            setIsViewDetailsModalOpen(false);
          } : null}
          onReject={selectedResident?.status === 'Pending' ? (requestId) => {
            const item = data.find(d => d.requestId === requestId);
            if (item) handleReject(item);
            setIsViewDetailsModalOpen(false);
          } : null}
          onComplete={selectedResident?.status === 'Approved' ? (requestId) => {
            const item = data.find(d => d.requestId === requestId);
            if (item) handleCompleteDocument(item);
            setIsViewDetailsModalOpen(false);
          } : null}
        />
      ) : (
        <ViewDetailsModal
          isOpen={isViewDetailsModalOpen}
          onClose={() => setIsViewDetailsModalOpen(false)}
          resident={selectedResident}
          documentRequest={null}
          title="Resident Details"
          showActions={modalType === 'resident-requests'}
          onApprove={() => { handleAccept(selectedResident); setIsViewDetailsModalOpen(false); }}
          onReject={() => { handleReject(selectedResident); setIsViewDetailsModalOpen(false); }}
        />
      )}

      <RejectionReasonModal
        isOpen={!!rejectionModal}
        onClose={() => setRejectionModal(null)}
        onSubmit={handleRejectionSubmit}
        title={rejectionModal?.title}
        itemName={rejectionModal?.itemName}
        loading={rejectionLoading}
      />

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