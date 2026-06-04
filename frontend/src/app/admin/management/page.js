'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Shield, Eye, Settings, Trash2, Key, Plus, CheckCircle, XCircle, Search, MoreVertical, Edit, EyeOff, Crown, UserX, FileText, AlertTriangle, ChevronDown } from 'lucide-react';
import NotificationModal from '@/app/components/NotificationModal';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import ViewDetailsModal from '@/app/components/ViewDetailsModal';
import RequestModal from '@/app/components/requests/RequestModal';
import RejectionReasonModal from '@/app/components/RejectionReasonModal';
import Link from 'next/link';

const ADMIN_ALLOWED_TABS = ['residents', 'document-requests'];

const managementTabConfig = {
  residents: { label: 'Residents', icon: Users, color: 'green', description: 'Manage verified resident records' },
  'document-requests': { label: 'Document Requests', icon: FileText, color: 'purple', description: 'Review and process document requests' },
};

// Helper function to get proper CSS classes for active tabs
const getActiveTabStyles = (color) => {
  const styles = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm',
    orange: 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm',
    purple: 'bg-violet-50 text-violet-700 border border-violet-200 shadow-sm',
  };
  return styles[color] || 'bg-gray-100 text-gray-700 border border-gray-200';
};

function CustomManagementDropdown({ value, options, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        className="flex h-11 w-full min-w-[150px] items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all hover:border-blue-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      >
        <span className="truncate">{selectedOption?.label || 'Select'}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full min-w-[180px] overflow-hidden rounded-2xl border border-blue-100 bg-white p-1.5 shadow-[0_18px_45px_rgba(30,37,102,0.16)]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-all ${
                option.value === value
                  ? 'bg-[#004AAD] text-white'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-[#004AAD]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const loadedTabRef = useRef(null);
  const fetchRequestRef = useRef(0);

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

    if (role === 'SUPER_ADMIN') {
      router.push('/superadmin/management');
      return;
    }

    setUser(user);
    setRole(role);
    setLoading(false);
  }, [router]);

  // Handle URL parameter changes for tab switching
  useEffect(() => {
    if (!loading) {
      const tabParam = searchParams.get('tab');
      if (tabParam && !ADMIN_ALLOWED_TABS.includes(tabParam)) {
        router.replace('/admin/management', { scroll: false });
        return;
      }
      const nextTab = tabParam && ADMIN_ALLOWED_TABS.includes(tabParam) ? tabParam : 'residents';
      if (activeTab !== nextTab) {
        setActiveTab(nextTab);
      }
      if (loadedTabRef.current !== nextTab) {
        loadedTabRef.current = nextTab;
        fetchData(nextTab);
      }
    }
  }, [searchParams, loading, activeTab, router]);

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
    if (!ADMIN_ALLOWED_TABS.includes(tab)) {
      tab = 'residents';
    }
    const requestId = fetchRequestRef.current + 1;
    fetchRequestRef.current = requestId;
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      switch (tab) {
        case 'residents':
          endpoint = 'residents';
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
      if (fetchRequestRef.current !== requestId) return;

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
      if (fetchRequestRef.current !== requestId) return;
      console.error(`Error fetching ${tab}:`, err);
      setData([]);
      setTotalPages(1);
    } finally {
      if (fetchRequestRef.current === requestId) {
        setLoadingData(false);
      }
    }
  };

  const handleTabChange = (tab) => {
    if (!ADMIN_ALLOWED_TABS.includes(tab)) return;
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSearchQuery('');
    setSitioFilter('');
    setStatusFilter('');
    setSortOrder('asc');
    setCurrentPage(1);
    setOpenDropdownId(null);
    loadedTabRef.current = tab;
    fetchData(tab);
    
    // Update URL to reflect the current tab using Next.js router
    const newUrl = tab === 'residents' ? '/admin/management' : `/admin/management?tab=${tab}`;
    window.history.pushState(null, '', newUrl);
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

  const handleViewInfo = async (resident) => {
    if (activeTab === 'document-requests') {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/document-requests/${resident.requestId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const requestDetails = await response.json();
          setSelectedResident({
            ...resident,
            ...requestDetails,
            resident: resident.resident,
            residentFirstName: resident.residentFirstName,
            residentLastName: resident.residentLastName,
            residentFullName: resident.residentFullName,
            residentEmail: resident.residentEmail,
          });
        } else {
          setSelectedResident(resident);
        }
      } catch (error) {
        console.error('Failed to load request details:', error);
        setSelectedResident(resident);
      }
    } else {
      setSelectedResident(resident);
    }
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

  const currentTabConfig = managementTabConfig[activeTab] || managementTabConfig.residents;
  const CurrentTabIcon = currentTabConfig.icon;
  const filteredData = data
    .filter((item) => {
      if (activeTab === 'residents' && sitioFilter && sitioFilter.trim() !== '') {
        if (item.sitio !== sitioFilter) return false;
      }

      if (activeTab === 'document-requests' && statusFilter && statusFilter.trim() !== '') {
        if (item.status !== statusFilter) return false;
      }

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
      if (activeTab === 'document-requests') {
        const nameA = `${a.resident?.firstName || ''} ${a.resident?.lastName || ''}`.toLowerCase();
        const nameB = `${b.resident?.firstName || ''} ${b.resident?.lastName || ''}`.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }

      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  const computedTotalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, computedTotalPages);
  const paginatedData = filteredData.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);
  const activeFilterTags = [
    searchQuery.trim() ? { label: `Search: ${searchQuery.trim()}`, onClear: () => setSearchQuery('') } : null,
    sitioFilter ? { label: `Sitio: ${sitioFilter}`, onClear: () => setSitioFilter('') } : null,
    statusFilter ? { label: `Status: ${statusFilter}`, onClear: () => setStatusFilter('') } : null,
  ].filter(Boolean);

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
    <div
      className="pt-24 px-6 md:px-8 min-h-screen bg-[#F8FBFF] pb-16 font-[family-name:var(--font-inter)]"
    >
      <div
        className="mb-6"
      >
        <div className="rounded-[1.5rem] border border-blue-100 bg-white p-2 shadow-sm">
          <div className="grid gap-2 md:grid-cols-2">
            {ADMIN_ALLOWED_TABS.map((tabId) => {
              const tab = { id: tabId, ...managementTabConfig[tabId] };
              return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? getActiveTabStyles(tab.color)
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E2566]'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-[0_18px_45px_rgba(30,37,102,0.08)]"
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/40 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#004AAD] text-white shadow-sm">
                <CurrentTabIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#1E2566]">{currentTabConfig.label}</h2>
                <p className="text-sm text-slate-500">{filteredData.length} visible of {data.length} records</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <CustomManagementDropdown
                value={sortOrder}
                options={[
                  { value: 'asc', label: 'Name A-Z' },
                  { value: 'desc', label: 'Name Z-A' },
                ]}
                onChange={(nextValue) => {
                  setSortOrder(nextValue);
                  setCurrentPage(1);
                }}
              />
              {activeTab === 'document-requests' && (
                <CustomManagementDropdown
                  value={statusFilter}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'Rejected', label: 'Rejected' },
                    { value: 'Cancelled', label: 'Cancelled' },
                  ]}
                  onChange={(nextValue) => {
                    setStatusFilter(nextValue);
                    setCurrentPage(1);
                  }}
                />
              )}
              {activeTab === 'residents' && availableSitios.length > 0 && (
                <CustomManagementDropdown
                  value={sitioFilter}
                  options={[
                    { value: '', label: 'All Sitios' },
                    ...availableSitios.map((sitio) => ({ value: sitio, label: sitio })),
                  ]}
                  onChange={(nextValue) => {
                    setSitioFilter(nextValue);
                    setCurrentPage(1);
                  }}
                />
              )}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 lg:w-80"
                />
              </div>
            </div>
          </div>
          {activeFilterTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activeFilterTags.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => {
                    tag.onClear();
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-bold text-[#004AAD] shadow-sm hover:bg-blue-50"
                >
                  {tag.label}
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )}
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
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {activeTab === 'document-requests' ? 'Resident' : 'Name'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {activeTab === 'document-requests' ? 'Document' : 'Email'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {activeTab === 'document-requests' ? 'Date' : 'Phone'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {activeTab === 'administrators' ? 'Role' : activeTab === 'residents' ? 'Sitio' : 'Status'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-[0.16em] text-slate-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedData.map((item, index) => (
                      <tr
                        key={`${activeTab}-${item.requestId || item.residentId}-${index}`}
                        onClick={() => handleViewInfo(item)}
                        className="cursor-pointer transition-colors hover:bg-blue-50/40"
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
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#004AAD]">
                            <Search className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-extrabold text-[#1E2566]">No records found</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">Try adjusting your search, sort, or filter options.</p>
                        </div>
                      </td>
                    </tr>
                  )}
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

            {(
              <div className="flex items-center justify-between border-t border-blue-100 bg-slate-50/80 px-4 py-4 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                    disabled={safeCurrentPage === 1}
                    className="relative inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(computedTotalPages, safeCurrentPage + 1))}
                    disabled={safeCurrentPage === computedTotalPages}
                    className="ml-3 relative inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Showing <span className="font-extrabold text-[#1E2566]">{filteredData.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-extrabold text-[#1E2566]">{Math.min(safeCurrentPage * itemsPerPage, filteredData.length)}</span> of{' '}
                      <span className="font-extrabold text-[#1E2566]">{filteredData.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                        disabled={safeCurrentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 text-sm font-bold text-slate-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: computedTotalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center border-l border-slate-200 px-4 py-2 text-sm font-bold ${
                            page === safeCurrentPage
                              ? 'z-10 bg-[#004AAD] text-white'
                              : 'bg-white text-slate-500 hover:bg-blue-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(computedTotalPages, safeCurrentPage + 1))}
                        disabled={safeCurrentPage === computedTotalPages}
                        className="relative inline-flex items-center border-l border-slate-200 px-3 py-2 text-sm font-bold text-slate-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
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
      </div>

      {/* Conditional Modal Rendering */}
      {modalType === 'document-requests' ? (
        isViewDetailsModalOpen && selectedResident && (
          <RequestModal
            request={selectedResident}
            user={null}
            onClose={() => {
              setIsViewDetailsModalOpen(false);
              fetchData(activeTab);
            }}
            cancelRequest={async () => ({ success: false, error: 'Not supported in admin view' })}
            completeRequest={async (requestId) => {
              const token = localStorage.getItem('token');
              const response = await fetch(`http://localhost:8080/api/admin/requests/${requestId}/complete`, {
                method: 'PUT',
                headers: token ? {
                  'Authorization': `Bearer ${token}`,
                } : {},
              });
              if (!response.ok) throw new Error('Failed to mark request as complete.');
              return response.json();
            }}
            onUpdateRequest={() => fetchData(activeTab)}
          />
        )
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
    </div>
  );
}
