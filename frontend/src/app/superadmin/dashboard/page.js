'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, FileText, Activity, LogOut,
  Check, X, Clock, ArrowRight, Plus,
  UserPlus, FilePlus, Settings, Bell,
  TrendingUp, AlertCircle, Search, ChevronRight,
  Megaphone, Send, XCircle, CheckCircle, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PendingAccountDetailsModal from '@/app/components/PendingAccountDetailsModal';
import RequestDetailsModal from '@/app/components/RequestDetailsModal';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  // Real data states
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalRequests: 0,
    pendingRequests: 0,
    pendingResidents: 0,
    totalAnnouncements: 0,
    activeAnnouncements: 0
  });
  const [recentDocRequests, setRecentDocRequests] = useState([]);
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [requestsError, setRequestsError] = useState(null);

  // Modal state for pending account details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Modal state for request details
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [requestModalLoading, setRequestModalLoading] = useState(false);

  // Announcement states
  const [announcements, setAnnouncements] = useState([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Loading states for approve/reject actions
  const [actionLoading, setActionLoading] = useState({ approve: false, reject: false, accountId: null });

  // API base URL
  const API_BASE = 'http://localhost:8080/api/superadmin';

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Close notification
  const closeNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  // Set action loading state
  const setActionLoadingState = (action, accountId, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [action]: isLoading,
      accountId: isLoading ? accountId : null
    }));
  };

  // Check if specific action is loading
  const isActionLoading = (action, accountId) => {
    return actionLoading[action] && actionLoading.accountId === accountId;
  };

  // Function to handle posting announcement
  const handlePostAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      showNotification('Please fill in both title and content fields', 'error');
      return;
    }

    try {
      setAnnouncementLoading(true);
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: announcementTitle.trim(),
          content: announcementContent.trim(),
          postedBy: currentUser.firstName + ' ' + currentUser.lastName
        })
      });

      if (response.ok) {
        const newAnnouncement = await response.json();
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setAnnouncementTitle('');
        setAnnouncementContent('');
        showNotification('Announcement posted successfully!', 'success');
        fetchDashboardData(); // Refresh stats
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to post announcement:', errorData.message || response.statusText);
        showNotification(errorData.message || 'Failed to post announcement. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      showNotification('Error connecting to server. Please check your internet connection.', 'error');
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // Function to fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const announcementsData = await response.json();
        setAnnouncements(announcementsData);
      } else {
        console.error('Failed to fetch announcements:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      setRequestsError(null);
      const token = localStorage.getItem('token');

      // Fetch summary statistics
      const summaryResponse = await fetch(`${API_BASE}/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setStats({
          totalResidents: summaryData.totalResidents || 0,
          totalRequests: summaryData.totalRequests || 0,
          pendingRequests: summaryData.pendingRequests || 0,
          pendingResidents: summaryData.pendingResidents || 0,
          totalAnnouncements: summaryData.totalAnnouncements || 0,
          activeAnnouncements: summaryData.activeAnnouncements || 0
        });
      }

      // Fetch recent document requests using the new enhanced endpoint
      const requestsResponse = await fetch(`${API_BASE}/recent-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        const recentRequests = requestsData.map(req => {
          // Extract resident name from the nested object structure
          let residentName = 'Unknown Resident';
          if (req.resident) {
            if (req.resident.fullName && req.resident.fullName.trim()) {
              residentName = req.resident.fullName;
            } else if (req.resident.firstName && req.resident.lastName) {
              residentName = [req.resident.firstName, req.resident.lastName].filter(name => name && name.trim()).join(' ').trim();
            } else if (req.resident.firstName || req.resident.lastName) {
              residentName = [req.resident.firstName, req.resident.lastName].filter(name => name && name.trim()).join(' ').trim();
            }
          }
          
          return {
            id: req.requestId,
            resident: residentName,
            email: req.resident?.email || '',
            documentName: req.documentName || 'Unknown Document',
            details: req.details || '',
            // Format: "Oct 24, 2023"
            date: req.submittedAt ? new Date(req.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            // Format: "10:30 AM"
            time: req.submittedAt ? new Date(req.submittedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            // Format full datetime for sorting and detailed view
            submittedAt: req.submittedAt,
            status: req.status
          };
        });
        setRecentDocRequests(recentRequests);
      } else {
        console.error('Failed to fetch recent requests:', requestsResponse.statusText);
        setRequestsError('Failed to load recent requests');
        setRecentDocRequests([]);
      }

      // Fetch pending resident approvals
      const residentRequestsResponse = await fetch(`${API_BASE}/resident-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (residentRequestsResponse.ok) {
        const residentRequestsData = await residentRequestsResponse.json();
        const formattedData = residentRequestsData.map(resident => ({
          id: resident.residentId,
          name: resident.firstName + ' ' + resident.lastName,
          email: resident.residentEmail,
          date: new Date(resident.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));
        setPendingAccounts(formattedData);
      }

      // Fetch announcements
      await fetchAnnouncements();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setRequestsError('Failed to connect to server. Please check your internet connection.');
      setRecentDocRequests([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Function to fetch detailed account information
  const fetchAccountDetails = async (accountId) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('token');
      
      // Use the same endpoint as the working resident-requests page
      const response = await fetch(`${API_BASE}/resident-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const allResidents = await response.json();
        console.log('=== DASHBOARD DEBUG ===');
        console.log('API Response - allResidents:', allResidents);
        console.log('Number of residents:', allResidents.length);
        console.log('Looking for accountId:', accountId);
        
        // Find the specific resident by ID
        const resident = allResidents.find(r => r.residentId === parseInt(accountId));
        console.log('Found resident object:', resident);
        
        if (resident) {
          console.log('Resident validIdPath:', resident.validIdPath);
          console.log('Setting accountDetails to:', resident);
          setAccountDetails(resident);
        } else {
          console.error('Resident not found with ID:', accountId);
          showNotification('Resident not found', 'error');
        }
      } else {
        console.error('Failed to fetch account details');
        showNotification('Failed to load account details', 'error');
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
      showNotification('Error loading account details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Function to fetch request details
  const fetchRequestDetails = async (requestId) => {
    try {
      setRequestModalLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/requests/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const request = await response.json();
        setRequestDetails({
          id: request.id,
          requestId: request.requestId,
          documentId: request.documentId,
          documentName: request.documentName,
          details: request.details,
          status: request.status,
          submittedAt: request.submittedAt,
          updatedAt: request.updatedAt,
          resident: request.resident?.fullName || 'Unknown Resident',
          email: request.resident?.email || '',
          attachmentCount: request.attachmentCount || 0
        });
      } else {
        console.error('Failed to fetch request details:', response.statusText);
        setRequestDetails(null);
        showNotification('Failed to load request details', 'error');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      setRequestDetails(null);
      showNotification('Error loading request details', 'error');
    } finally {
      setRequestModalLoading(false);
    }
  };

  // Function to handle viewing request details
  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setIsRequestModalOpen(true);
    fetchRequestDetails(request.id);
  };

  // Function to handle viewing account details
  const handleViewAccountDetails = (account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
    fetchAccountDetails(account.id);
  };

  // Enhanced function to handle account approval
  const handleApproveAccount = async (accountId) => {
    try {
      setActionLoadingState('approve', accountId, true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/resident-requests/${accountId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Close modal and refresh data
        setIsModalOpen(false);
        setSelectedAccount(null);
        setAccountDetails(null);
        fetchDashboardData();
        showNotification('Account approved successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to approve account:', errorData.message || response.statusText);
        showNotification(errorData.message || 'Failed to approve account. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error approving account:', error);
      showNotification('Error connecting to server. Please check your internet connection.', 'error');
    } finally {
      setActionLoadingState('approve', accountId, false);
    }
  };

  // Enhanced function to handle account rejection
  const handleRejectAccount = async (accountId) => {
    try {
      setActionLoadingState('reject', accountId, true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/resident-requests/${accountId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Close modal and refresh data
        setIsModalOpen(false);
        setSelectedAccount(null);
        setAccountDetails(null);
        fetchDashboardData();
        showNotification('Account rejected successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to reject account:', errorData.message || response.statusText);
        showNotification(errorData.message || 'Failed to reject account. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error rejecting account:', error);
      showNotification('Error connecting to server. Please check your internet connection.', 'error');
    } finally {
      setActionLoadingState('reject', accountId, false);
    }
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
    setAccountDetails(null);
  };

  // Function to close request modal
  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false);
    setSelectedRequest(null);
    setRequestDetails(null);
  };

  // Function to handle request approval
  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Close modal and refresh data
        setIsRequestModalOpen(false);
        setSelectedRequest(null);
        setRequestDetails(null);
        fetchDashboardData();
        showNotification('Request approved successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to approve request:', errorData.message || response.statusText);
        showNotification(errorData.message || 'Failed to approve request. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('Error connecting to server. Please check your internet connection.', 'error');
    }
  };

  // Function to handle request rejection
  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Close modal and refresh data
        setIsRequestModalOpen(false);
        setSelectedRequest(null);
        setRequestDetails(null);
        fetchDashboardData();
        showNotification('Request rejected successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to reject request:', errorData.message || response.statusText);
        showNotification(errorData.message || 'Failed to reject request. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification('Error connecting to server. Please check your internet connection.', 'error');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }

    setUser(storedUser);
    setLoading(false);
    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  // Navigation Handlers
  const handleAddAdmin = () => router.push('/superadmin/management/admins');
  const handleAddDocument = () => router.push('/superadmin/documents/add');
  const handleManageResidents = () => router.push('/superadmin/management?tab=residents');
  const handleViewNotifications = () => router.push('/superadmin/notifications');

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
          <p className="text-slate-500 font-medium text-sm">Loading System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
       
      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={`fixed top-4 right-4 z-[70] p-4 rounded-xl shadow-2xl border max-w-sm ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <p className="font-medium text-sm">{notification.message}</p>
              <button
                onClick={closeNotification}
                className="ml-auto p-1 rounded-full hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        
      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-25">
           

        {dataLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
             {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
             <div className="col-span-1 md:col-span-3 h-96 bg-slate-200 rounded-xl mt-6"></div>
             <div className="col-span-1 h-96 bg-slate-200 rounded-xl mt-6"></div>
           </div>
        ) : (
          <div className="space-y-8">
                
            {/* 1. QUICK ACTIONS BAR - More spaced out and cleaner */}
            <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] p-5 rounded-xl border-0 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg text-white">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-white">Quick Actions</h3>
                   <p className="text-xs text-white/80">Manage your system efficiently</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <ActionButton icon={UserPlus} label="New Admin" onClick={handleAddAdmin} />
                <ActionButton icon={FilePlus} label="Add Document" onClick={handleAddDocument} />
                <ActionButton icon={Users} label="Residents" onClick={handleManageResidents} />
                <ActionButton icon={Bell} label="Notifications" onClick={handleViewNotifications} />
              </div>
            </div>

            {/* 2. METRICS GRID - Refined Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="Total Residents"
                value={stats.totalResidents}
                icon={Users}
                color="text-blue-600"
                bgColor="bg-blue-50/80"
              />
              <StatCard
                label="New Requests"
                value={stats.pendingRequests}
                icon={FileText}
                color="text-amber-600"
                bgColor="bg-amber-50/80"
                alert={stats.pendingRequests > 0}
              />
              <StatCard
                label="Pending Accounts"
                value={stats.pendingResidents}
                icon={UserPlus}
                color="text-indigo-600"
                bgColor="bg-indigo-50/80"
                alert={stats.pendingResidents > 0}
              />
              <StatCard
                label="Active Announcements"
                value={stats.activeAnnouncements}
                icon={Megaphone}
                color="text-purple-600"
                bgColor="bg-purple-50/80"
                alert={stats.activeAnnouncements > 0}
              />
            </div>

            {/* 3. MAIN GRID CONTENT - Hidden Container for Height Alignment */}
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                {/* LEFT COLUMN: Post Announcement & Recent Requests (Takes up 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                   {/* POST ANNOUNCEMENT SECTION */}
                   <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Megaphone className="w-24 h-24 text-blue-900" />
                     </div>
                     
                     <div className="flex items-center gap-3 mb-4 relative z-10">
                       <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                         <Megaphone className="w-5 h-5" />
                       </div>
                       <div>
                         <h3 className="font-bold text-slate-800">Post Announcement</h3>
                         <p className="text-xs text-slate-500">Notify all residents</p>
                       </div>
                     </div>

                     <div className="space-y-3 relative z-10">
                       <div>
                         <input
                           type="text"
                           placeholder="Announcement Title"
                           value={announcementTitle}
                           onChange={(e) => setAnnouncementTitle(e.target.value)}
                           className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400"
                         />
                       </div>
                       <div>
                         <textarea
                           rows="3"
                           placeholder="Write your message here..."
                           value={announcementContent}
                           onChange={(e) => setAnnouncementContent(e.target.value)}
                           className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400 resize-none"
                         ></textarea>
                       </div>
                       <div className="flex justify-end pt-1">
                         <button 
                           onClick={handlePostAnnouncement}
                           disabled={announcementLoading || !announcementTitle.trim() || !announcementContent.trim()}
                           className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                         >
                           {announcementLoading ? (
                             <Loader className="w-3 h-3 animate-spin" />
                           ) : (
                             <Send className="w-3 h-3" />
                           )}
                           {announcementLoading ? 'Posting...' : 'Post Now'}
                         </button>
                       </div>
                     </div>
                   </div>

                   <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">Recent Requests</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Latest document submissions</p>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push('/superadmin/management?tab=document-requests')}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          View All Requests
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-4 font-semibold tracking-wider">Resident</th>
                              <th className="px-6 py-4 font-semibold tracking-wider">Document</th>
                              <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                              <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {recentDocRequests.slice(0, 5).map((req) => (
                              <tr
                                key={req.id}
                                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                onClick={() => handleViewRequestDetails(req)}
                              >
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{req.resident}</div>
                                  {req.email && <div className="text-xs text-slate-500 mt-0.5">{req.email}</div>}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-slate-700 font-medium">{req.documentName}</div>
                                  {req.details && <div className="text-xs text-slate-400 mt-1 truncate max-w-[180px]">{req.details}</div>}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-slate-600 font-medium text-xs">{req.date}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{req.time}</div>
                                </td>
                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                  <StatusBadge status={req.status} />
                                </td>
                              </tr>
                            ))}
                            {recentDocRequests.length === 0 && (
                              <tr>
                                <td colSpan="4" className="p-12 text-center">
                                  <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                       <FileText className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <div>
                                      <p className="text-slate-900 font-medium">No recent requests</p>
                                      <p className="text-xs text-slate-500 mt-1">Requests will appear here automatically</p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>

                {/* RIGHT COLUMN: Pending Accounts (Takes up 1/3) */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[600px]">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">Pending Accounts</h3>
                          <p className="text-xs text-slate-500 mt-0.5">New resident signups</p>
                        </div>
                      </div>
                      {stats.pendingResidents > 0 && (
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-100">
                          {stats.pendingResidents}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {pendingAccounts.map((account) => (
                        <motion.div
                          key={account.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white cursor-pointer relative"
                          onClick={() => handleViewAccountDetails(account)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white flex items-center justify-center font-bold text-sm shadow-lg">
                                {account.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 leading-tight">{account.name}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{account.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{account.date}</span>
                          </div>
                          {/* Buttons removed from here */}
                        </motion.div>
                      ))}
                      {pendingAccounts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-8">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                             <Check className="w-6 h-6 opacity-40" />
                          </div>
                          <p className="text-sm font-medium text-slate-600">All caught up!</p>
                          <p className="text-xs">No pending approvals</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                        <button onClick={handleManageResidents} className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 py-2 transition-colors">
                          View All Residents <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pending Account Details Modal */}
      <PendingAccountDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        accountDetails={accountDetails}
        onApprove={handleApproveAccount}
        onReject={handleRejectAccount}
        loading={modalLoading}
        actionLoading={actionLoading}
      />

      {/* Request Details Modal */}
      <RequestDetailsModal
        isOpen={isRequestModalOpen}
        onClose={handleCloseRequestModal}
        requestDetails={requestDetails}
        loading={requestModalLoading}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />
    </div>
  );
}

// --- SUB COMPONENTS (Refined) ---

function StatCard({ label, value, icon: Icon, color, bgColor, alert }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      {alert && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-4 ring-red-100"></div>}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgColor} ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold hover:border-blue-400 hover:text-blue-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
  };
  
  return (
    <span className={`inline-flex items-center justify-center min-w-[80px] px-3 py-1 rounded-md text-[11px] font-bold border ${styles[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
}