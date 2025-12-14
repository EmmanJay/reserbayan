'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Megaphone, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useRequests } from '@/hooks/useRequests';
import PendingRestrictionModal from '@/app/components/PendingRestrictionModal';
import RequestModal from '@/app/components/requests/RequestModal'; // Detail View
import RequestFormModal from '@/app/components/requests/RequestFormModal'; // Create View
import AccountActivityModal from '@/app/components/AccountActivityModal';
import RejectedResubmitModal from '@/app/components/RejectedResubmitModal';

export default function DashboardPage() {
  const { user } = useUser();
  const { requests, loading, refetchRequests, cancelRequest } = useRequests(user);
  const router = useRouter();
  
  // Modals state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);
  const [showAccountActivityModal, setShowAccountActivityModal] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());

  const recentRequests = useMemo(() => {
    return requests
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 3);
  }, [requests]);

  // Fetch announcements for residents
  const fetchAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        console.error('No authentication token found');
        setAnnouncements([]);
        return;
      }
      
      const response = await fetch('http://localhost:8080/api/residents/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const responseData = await response.json();
        // Extract the announcements array from the response
        const announcementsList = responseData.announcements || [];
        console.log('Fetched announcements:', announcementsList.length, announcementsList);
        setAnnouncements(announcementsList);
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to fetch announcements:', response.status, response.statusText, errorText);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  // Toggle announcement card expansion
  const toggleAnnouncementExpansion = (announcementId) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openActivity') === 'true') {
      setShowAccountActivityModal(true);
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <motion.div
      className="pt-32 px-8 min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F5F7FA] pb-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <h1 className="font-montserrat font-extrabold text-4xl md:text-5xl text-blue-900 mb-4">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
            Manage your document requests and stay updated with announcements.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <h2 className="font-montserrat font-bold text-3xl text-gray-800 mb-8">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                if (user.status === 'PENDING') {
                  setShowPendingModal(true);
                  return;
                }
                if (user.status === 'REJECTED') {
                  setShowRejectedModal(true);
                  return;
                }
                setShowRequestModal(true);
              }}
              className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-3"
            >
              <Plus className="w-6 h-6" />
              <span>Request Document</span>
            </button>

            <Link
              href="/documents"
              className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 flex items-center space-x-3"
            >
              <FileText className="w-6 h-6" />
              <span>Browse Documents</span>
            </Link>
          </div>
        </motion.div>

        {/* Announcements Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
              <Megaphone className="w-6 h-6 text-[#1E2566]" />
            </div>
            <h2 className="font-montserrat font-bold text-3xl text-gray-800">Announcements</h2>
          </div>

          {announcementsLoading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E2566] mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg">Loading announcements...</p>
            </div>
          ) : announcements.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-8">
                <div className="space-y-6">
                  {announcements.slice(0, 3).map((announcement, index) => {
                    const isExpanded = expandedAnnouncements.has(announcement.announcementId);
                    
                    return (
                      <motion.div
                        key={announcement.announcementId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
                              <Megaphone className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-[#1E2566] transition-colors line-clamp-2">
                                {announcement.title}
                              </h4>
                              <p className="text-xs md:text-sm text-gray-500 flex items-center mt-1">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                <span className="truncate">
                                  Posted by {announcement.postedBy} on {new Date(announcement.createdAt).toLocaleDateString()}
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Toggle Button */}
                          <button
                            onClick={() => toggleAnnouncementExpansion(announcement.announcementId)}
                            className="ml-2 md:ml-4 p-1.5 md:p-2 rounded-full hover:bg-white hover:bg-opacity-50 transition-all duration-200 group/toggle flex-shrink-0"
                            aria-label={isExpanded ? 'Collapse announcement' : 'Expand announcement'}
                            aria-expanded={isExpanded}
                            aria-controls={`announcement-content-${announcement.announcementId}`}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-[#1E2566] group-hover/toggle:text-[#2F87C3] transition-colors" />
                            ) : (
                              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-[#1E2566] group-hover/toggle:text-[#2F87C3] transition-colors" />
                            )}
                          </button>
                        </div>
                        
                        {/* Announcement Content */}
                        <motion.div
                          id={`announcement-content-${announcement.announcementId}`}
                          initial={false}
                          animate={{
                            height: isExpanded ? 'auto' : 0,
                            opacity: isExpanded ? 1 : 0
                          }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 md:pt-3">
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {announcement.content}
                            </p>
                          </div>
                        </motion.div>
                        
                        {/* Collapsed Preview */}
                        {!isExpanded && (
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed line-clamp-2 md:line-clamp-3 group-hover:text-gray-800 transition-colors">
                            {announcement.content}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                {announcements.length > 3 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => router.push('/announcements')}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <span>View All Announcements ({announcements.length})</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Megaphone className="w-12 h-12 text-[#1E2566]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">No Announcements</h3>
              <p className="text-gray-500 text-lg">There are no announcements at this time. Check back later!</p>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <h2 className="font-montserrat font-bold text-3xl text-gray-800 mb-8">Recent Activity</h2>
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg">Loading your recent requests...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-8">
                <div className="space-y-6">
                  {/* Account Activity */}
                  {(user.status?.toLowerCase() === 'pending' || user.status?.toLowerCase() === 'approved' || user.status?.toLowerCase() === 'rejected') && (
                    <motion.div
                      onClick={() => setShowAccountActivityModal(true)}
                      className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-xl p-3 w-12 h-12 flex items-center justify-center shadow-lg">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">Account Registration</h4>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {user.status?.toLowerCase() === 'pending' ? 'Under review by administrators' :
                             user.status?.toLowerCase() === 'approved' ? 'Approved and active' :
                             'Requires resubmission'}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                        user.status?.toLowerCase() === 'approved' ? 'text-green-600 bg-green-50' :
                        user.status?.toLowerCase() === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                        'text-red-600 bg-red-50'
                      }`}>
                        {getStatusIcon(user.status)}
                        <span className="capitalize">{user.status}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Document Requests */}
                  {recentRequests.map((request, index) => (
                    <motion.div
                      key={request.requestId}
                      onClick={() => setViewRequest(request)}
                      className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-xl p-3 w-12 h-12 flex items-center justify-center shadow-lg">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{request.documentName}</h4>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Submitted {new Date(request.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="capitalize">{request.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {recentRequests.length > 0 && (
                  <div className="mt-8 text-center">
                    <Link
                      href="/requests"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <span>View All Requests</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* === MODALS SECTION === */}
        
        {/* 1. CREATE REQUEST MODAL */}
        {showRequestModal && (
          <RequestFormModal 
            user={user}
            onClose={() => setShowRequestModal(false)}
            onSuccess={refetchRequests}
          />
        )}

        {/* 2. VIEW DETAILS MODAL */}
        {viewRequest && (
          <RequestModal
            request={viewRequest}
            user={user}
            onClose={() => setViewRequest(null)}
            cancelRequest={cancelRequest}
          />
        )}

        {/* 3. RESTRICTION MODAL */}
        <PendingRestrictionModal
          isOpen={showPendingModal}
          onClose={() => setShowPendingModal(false)}
        />

        {/* 4. REJECTED RESUBMIT MODAL */}
        <RejectedResubmitModal
          isOpen={showRejectedModal}
          onClose={() => setShowRejectedModal(false)}
          onResubmit={() => {
            setShowRejectedModal(false);
            setShowAccountActivityModal(true);
          }}
        />


        {/* 6. ACCOUNT ACTIVITY MODAL */}
        <AccountActivityModal
          isOpen={showAccountActivityModal}
          onClose={() => setShowAccountActivityModal(false)}
          user={user}
          onResubmit={() => {
            // For now, just close - EditDetailsModal will be opened from AccountActivityModal
          }}
        />
      </div>
    </motion.div>
  );
}
