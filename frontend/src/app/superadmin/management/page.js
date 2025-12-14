'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Shield, Eye, Settings, Trash2, Key, Plus, CheckCircle, XCircle, Search, MoreVertical, Edit, EyeOff, Crown, UserX, FileText, AlertTriangle } from 'lucide-react';
import NotificationModal from '@/app/components/NotificationModal';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import ViewDetailsModal from '@/app/components/ViewDetailsModal';
import RequestDetailsModal from '@/app/components/RequestDetailsModal';
import { motion } from 'framer-motion';

import Link from 'next/link';

export default function SuperAdminManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get tab from URL parameters, default to 'administrators'
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    const validTabs = ['administrators', 'residents', 'resident-requests', 'document-requests'];
    return validTabs.includes(tabParam) ? tabParam : 'administrators';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
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
  const [addAdminModal, setAddAdminModal] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [viewInfoModal, setViewInfoModal] = useState(null);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [passwordWarningModal, setPasswordWarningModal] = useState(null);
  const [passwordRevealModal, setPasswordRevealModal] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
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

    fetchData(activeTab);
  }, [router, activeTab]);

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

  // Handle URL parameter changes for tab selection
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTabs = ['administrators', 'residents', 'resident-requests', 'document-requests'];
    if (validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const fetchData = async (tab) => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      switch (tab) {
        case 'administrators':
          endpoint = 'admins';
          break;
        case 'residents':
          endpoint = 'residents';
          break;
        case 'resident-requests':
          endpoint = 'resident-requests';
          break;
        case 'document-requests':
          endpoint = 'requests'; // Assuming this endpoint exists
          break;
        default:
          endpoint = 'admins';
      }

      const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error(`Failed to fetch ${tab}`);
      let data = await response.json();

      // Filter document requests to show only pending ones
      if (tab === 'document-requests') {
        data = data.filter(item => item.status === 'Pending');
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
    setCurrentPage(1);
    setOpenDropdownId(null); // Close any open dropdown when switching tabs
  };

  const handleManage = (type, item, event) => {
    event.preventDefault();
    event.stopPropagation();

    const dropdownId = activeTab === 'document-requests' ? item.requestId : item.residentId;

    if (openDropdownId === dropdownId) {
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
      setOpenDropdownId(dropdownId);
    }
  };

  const handleDropdownClick = (e, itemId) => {
    e.stopPropagation();
    if (openDropdownId === itemId) {
        setOpenDropdownId(null);
        setButtonRect(null); // Clear the rect on close
    } else {
        setOpenDropdownId(itemId);
        // Save the button's exact position data
        setButtonRect(e.currentTarget.getBoundingClientRect());
    }
  };

  const handleDelete = (item) => {
    const entityType = activeTab === 'administrators' ? 'administrator' : activeTab === 'residents' ? 'resident' : 'request';

    setConfirmationModal({
      type: 'delete',
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${entityType}? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        const endpoint = activeTab === 'administrators' ? 'admins' : activeTab === 'residents' ? 'residents' : 'resident-requests';

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}/${item.residentId}`, {
            method: 'DELETE',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to delete');

          // Refresh data
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
    // For admin, verify SuperAdmin password first
    if (activeTab === 'administrators') {
      const password = prompt('Enter your Super Admin password to reset this administrator\'s password:');
      if (!password) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/superadmin/verify-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ password }),
        });

        const result = await response.json();
        if (!result.valid) {
          setNotificationModal({
            type: 'error',
            title: 'Authentication Failed',
            message: 'Incorrect Super Admin password. Access denied.',
            autoClose: true,
            autoCloseDelay: 4000
          });
          return;
        }
      } catch (err) {
        setNotificationModal({
          type: 'error',
          title: 'Error',
          message: 'Failed to verify password: ' + err.message
        });
        return;
      }
    }

    const newPassword = prompt(`Enter new password for ${item.firstName} ${item.lastName}:`);
    if (!newPassword) return;

    const endpoint = activeTab === 'administrators' ? 'admins' : 'residents';

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

  const handleAddAdmin = async () => {
    if (!newAdminUsername.trim()) {
      alert('Please enter a username');
      return;
    }

    const newAdmin = {
      username: newAdminUsername.trim(),
      password: 'Admin123',
      role: 'ADMIN',
      status: 'ACTIVE',
      firstName: newAdminUsername.trim(),
      middleName: '',
      lastName: '',
      residentEmail: `${newAdminUsername.trim()}@reserbayan.com`,
      phoneNumber: '',
      address: '',
      position: '',
      proofOfEmploymentPath: ''
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/superadmin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newAdmin),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add admin');
      }

      // Refresh the data
      fetchData(activeTab);

      setNotificationModal({
        type: 'success',
        title: 'Administrator Added',
        message: 'Administrator added successfully with default password: Admin123',
        autoClose: true,
        autoCloseDelay: 4000
      });
      setAddAdminModal(false);
      setNewAdminUsername('');
    } catch (err) {
      setNotificationModal({
        type: 'error',
        title: 'Failed to Add Administrator',
        message: 'Error adding administrator: ' + err.message
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

  const handleEditFromView = (item) => {
    setViewInfoModal(null);
    setEditModal(item);
  };

  const handleAccept = (item) => {
    const entityType = activeTab === 'resident-requests' ? 'resident' : 'document request';
    const endpoint = activeTab === 'resident-requests' ? 'resident-requests' : 'requests';

    setConfirmationModal({
      type: 'approve',
      title: 'Confirm Approval',
      message: `Are you sure you want to approve ${item.firstName} ${item.lastName}? This will grant them full access to request documents.`,
      confirmText: 'Approve',
      confirmButtonClass: 'bg-green-600 hover:bg-green-700',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}/${item.residentId}/approve`, {
            method: 'PUT',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to approve');

          // Refresh data
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
  };


  const handleSuperAdminPasswordVerification = async (item) => {
    const password = prompt('Enter your Super Admin password to view this administrator\'s password:');
    if (!password) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/superadmin/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();
      if (result.valid) {
        // Password verified, now show the admin's password
        setPasswordRevealModal({ item: item, password: item.plainPassword || 'Admin123' });
      } else {
        setNotificationModal({
          type: 'error',
          title: 'Authentication Failed',
          message: 'Incorrect Super Admin password. Access denied.',
          autoClose: true,
          autoCloseDelay: 4000
        });
      }
    } catch (err) {
      setNotificationModal({
        type: 'error',
        title: 'Error',
        message: 'Failed to verify password: ' + err.message
      });
    }
  };

  const handleToggleAdminStatus = async (item) => {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setConfirmationModal({
      type: 'toggle-status',
      title: `Confirm ${newStatus === 'ACTIVE' ? 'Activation' : 'Deactivation'}`,
      message: `Are you sure you want to ${newStatus === 'ACTIVE' ? 'activate' : 'deactivate'} ${item.firstName} ${item.lastName}?`,
      confirmText: newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate',
      confirmButtonClass: newStatus === 'ACTIVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/superadmin/admins/${item.residentId}/status`, {
            method: 'PUT',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to toggle status');

          fetchData(activeTab);
          setNotificationModal({
            type: 'success',
            title: 'Status Updated',
            message: `Administrator has been ${newStatus.toLowerCase()} successfully`,
            autoClose: true,
            autoCloseDelay: 3000
          });
        } catch (err) {
          setNotificationModal({
            type: 'error',
            title: 'Status Update Failed',
            message: 'Error updating administrator status: ' + err.message
          });
        }
      }
    });
  };

  const handleMakeSuperAdmin = async (item) => {
    setConfirmationModal({
      type: 'make-superadmin',
      title: 'Confirm Super Admin Promotion',
      message: `Are you sure you want to promote ${item.firstName} ${item.lastName} to Super Administrator? This will grant them full system access.`,
      confirmText: 'Promote',
      confirmButtonClass: 'bg-indigo-600 hover:bg-indigo-700',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/superadmin/admins/${item.residentId}/role`, {
            method: 'PUT',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to promote');

          fetchData(activeTab);
          setNotificationModal({
            type: 'success',
            title: 'Administrator Promoted',
            message: 'Administrator has been promoted to Super Admin successfully',
            autoClose: true,
            autoCloseDelay: 3000
          });
          setOpenDropdownId(null);
        } catch (err) {
          setNotificationModal({
            type: 'error',
            title: 'Promotion Failed',
            message: 'Error promoting administrator: ' + err.message
          });
        }
      }
    });
  };

  const handleReject = (item) => {
    const feedback = prompt(`Please provide feedback for rejecting ${item.firstName} ${item.lastName}:`);
    if (feedback === null) return; // User cancelled

    const entityType = activeTab === 'resident-requests' ? 'resident' : 'document request';
    const endpoint = activeTab === 'resident-requests' ? 'resident-requests' : 'requests';

    setConfirmationModal({
      type: 'reject',
      title: 'Confirm Rejection',
      message: `Are you sure you want to reject ${item.firstName} ${item.lastName}? This will permanently deny their access to the system.`,
      confirmText: 'Reject',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}/${item.residentId}/reject`, {
            method: 'PUT',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          if (!response.ok) throw new Error('Failed to reject');

          // TODO: Send notification with feedback to resident
          // For now, just show success message
          fetchData(activeTab);
          setNotificationModal({
            type: 'success',
            title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Rejected`,
            message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} has been rejected successfully`,
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
      {/* Header
      <motion.div
        className="mb-8 text-center relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl -z-10"></div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Oversee and manage all residents and administrators in the system.
          View recent users, reset passwords, delete accounts, or explore detailed management options.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-4"></div>
      </motion.div> */}

      {/* Tab Navigation */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <div className="flex space-x-1">
            {[
              { id: 'administrators', label: 'Administrators', icon: Shield, color: 'blue' },
              { id: 'residents', label: 'Residents', icon: Users, color: 'green' },
              { id: 'resident-requests', label: 'Resident Requests', icon: Users, color: 'orange' },
              { id: 'document-requests', label: 'Document Requests', icon: FileText, color: 'purple' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200`
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

      {/* Content Area */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        {/* Header with Search and Add Button */}
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
              {activeTab === 'administrators' && (
                <button
                  onClick={() => setAddAdminModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus size={16} />
                  Add Administrator
                </button>
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

        {/* Data Table */}
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
                      if (!searchQuery.trim()) return true;
                      const query = searchQuery.toLowerCase();
                      return (
                        item.firstName?.toLowerCase().includes(query) ||
                        item.lastName?.toLowerCase().includes(query) ||
                        item.middleName?.toLowerCase().includes(query) ||
                        item.residentEmail?.toLowerCase().includes(query) ||
                        item.phoneNumber?.toLowerCase().includes(query) ||
                        item.sitio?.toLowerCase().includes(query)
                      );
                    })
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item, index) => (
                      <tr key={`${activeTab}-${item.requestId || item.residentId}-${index}`} className="hover:bg-gray-50">
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
                              item.status === 'ACTIVE' || item.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
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
                    const item = data.find(d => (activeTab === 'document-requests' ? d.requestId : d.residentId) === openDropdownId);
                    if (!item) return null;

                    return (
                      <div className="space-y-1">
                        {activeTab === 'administrators' && (
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
                                handleSuperAdminPasswordVerification(item);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                            >
                              <EyeOff size={16} />
                              View Password
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

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMakeSuperAdmin(item);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                            >
                              <Crown size={16} />
                              Make Super Admin
                            </button>
                          </>
                        )}
                        {activeTab === 'residents' && (
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
                        )}
                        {activeTab === 'resident-requests' && (
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
                        )}
                        {activeTab === 'document-requests' && (
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
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 011.414-1.414z" clipRule="evenodd" />
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

      {/* Add Admin Modal */}
      {addAdminModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add New Administrator</h3>
                  <p className="text-sm text-gray-600">Create a new admin account</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Default Settings:</strong>
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Password: Admin123 (can be changed later)
                  </p>
                  <p className="text-sm text-blue-700">
                    Name: {newAdminUsername} (can be updated later)
                  </p>
                  <p className="text-sm text-blue-700">
                    Email: {newAdminUsername}@reserbayan.com (temporary)
                  </p>
                  <p className="text-sm text-blue-700">
                    Role: ADMIN, Status: ACTIVE
                  </p>
                  <p className="text-sm text-blue-700">
                    Other info: Empty (can be filled later)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddAdmin}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Administrator
                </button>
                <button
                  onClick={() => {
                    setAddAdminModal(false);
                    setNewAdminUsername('');
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {/* Password Warning Modal */}
      {passwordWarningModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Security Warning</h3>
                  <p className="text-sm text-gray-600">Password Visibility</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700">
                  WARNING: Viewing plain-text passwords poses a security risk and should only be used for critical recovery/verification purposes. Are you sure you want to proceed?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => confirmViewPassword(passwordWarningModal)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Proceed
                </button>
                <button
                  onClick={() => setPasswordWarningModal(null)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Password Reveal Modal */}
      {passwordRevealModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Key className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Current Password</h3>
                  <p className="text-sm text-gray-600">
                    {passwordRevealModal.item.firstName} {passwordRevealModal.item.lastName}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Password:</p>
                  <p className="text-lg font-mono text-gray-900 break-all">{passwordRevealModal.password}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPasswordRevealModal(null)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {/* Conditional Modal Rendering */}
      {modalType === 'document-requests' ? (
        <RequestDetailsModal
          isOpen={isViewDetailsModalOpen}
          onClose={() => setIsViewDetailsModalOpen(false)}
          requestDetails={selectedResident}
          onApprove={(requestId) => {
            const item = data.find(d => d.requestId === requestId);
            if (item) handleAccept(item);
            setIsViewDetailsModalOpen(false);
          }}
          onReject={(requestId) => {
            const item = data.find(d => d.requestId === requestId);
            if (item) handleReject(item);
            setIsViewDetailsModalOpen(false);
          }}
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