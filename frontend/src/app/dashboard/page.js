'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, FileText, Plus, ArrowRight, Calendar, Megaphone, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useRequestDrawer } from '@/contexts/RequestDrawerContext';
import { useRequests } from '@/hooks/useRequests';
import PendingRestrictionModal from '@/app/components/PendingRestrictionModal';
import RequestModal from '@/app/components/requests/RequestModal'; // Detail View
import RequestFormModal from '@/app/components/requests/RequestFormModal'; // Create View
import AccountActivityModal from '@/app/components/AccountActivityModal';
import RejectedResubmitModal from '@/app/components/RejectedResubmitModal';
import { StatusBadge } from '@/app/components/ui/status-badge';

export default function DashboardPage() {
  const { user } = useUser();
  const {
    draft: documentDetailRequestDraft,
    hasDraft: hasDocumentDetailRequestDraft,
    restoreRequest,
    discardRequest,
  } = useRequestDrawer();
  const { requests, loading, refetchRequests, cancelRequest } = useRequests(user);
  const router = useRouter();
  
  // Get user role for admin/superadmin redirects
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  
  // Modals state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);
  const [showAccountActivityModal, setShowAccountActivityModal] = useState(false);
  const [showExistingRequestPrompt, setShowExistingRequestPrompt] = useState(false);

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



  if (!user) {
    return null;
  }

  return (
    <motion.div
      className="pt-28 px-6 min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F5F7FA] pb-10"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="font-montserrat font-extrabold text-3xl md:text-4xl text-blue-900">
                Welcome back, {user.firstName}!
              </h1>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Resident Dashboard
              </span>
            </div>
            <p className="mt-2 text-sm md:text-base text-gray-600 leading-relaxed">
              Manage your requests, track recent activity, and review announcements at a glance.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg px-6 py-5">
                <h2 className="font-montserrat font-bold text-xl text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid gap-3 sm:grid-cols-2">
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
                      if (hasDocumentDetailRequestDraft) {
                        setShowExistingRequestPrompt(true);
                        return;
                      }
                      setShowRequestModal(true);
                    }}
                    className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-5 py-3 rounded-xl font-semibold text-sm md:text-base hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Request Document</span>
                  </button>

                  <Link
                    href="/documents"
                    className="bg-white border-2 border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold text-sm md:text-base hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Browse Documents</span>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="px-6 py-5">
                  <h2 className="font-montserrat font-bold text-xl text-gray-800 mb-4">Recent Activity</h2>
                  {loading ? (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-8 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 text-sm">Loading your recent requests...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Account Activity */}
                      {(user.status?.toLowerCase() === 'pending' || user.status?.toLowerCase() === 'approved' || user.status?.toLowerCase() === 'rejected') && (
                        <motion.div
                          onClick={() => setShowAccountActivityModal(true)}
                          className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-xl p-2.5 w-10 h-10 flex items-center justify-center shadow-lg">
                              <Users className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm md:text-base">Account Registration</h4>
                              <p className="text-xs md:text-sm text-gray-600 flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                {user.status?.toLowerCase() === 'pending' ? 'Under review by administrators' :
                                 user.status?.toLowerCase() === 'approved' ? 'Approved and active' :
                                 'Requires resubmission'}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={user.status} size="sm" />
                        </motion.div>
                      )}

                      {/* Document Requests */}
                      {recentRequests.map((request, index) => (
                        <motion.div
                          key={request.requestId}
                          onClick={() => setViewRequest(request)}
                          className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-xl p-2.5 w-10 h-10 flex items-center justify-center shadow-lg">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm md:text-base">{request.documentName}</h4>
                              <p className="text-xs md:text-sm text-gray-600 flex items-center">
                                <Calendar className="w-3.5 h-3.5 mr-1" />
                                Submitted {new Date(request.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={request.status} size="sm" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {recentRequests.length > 0 && (
                    <div className="mt-5 text-center">
                      {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') ? (
                        <button
                          onClick={() => {
                            const managementPath = userRole === 'SUPER_ADMIN' ? '/superadmin/management' : '/admin/management';
                            router.push(`${managementPath}?tab=document-requests`);
                          }}
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                        >
                          <span>View All Requests</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <Link
                          href="/requests"
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                        >
                          <span>View All Requests</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Announcements Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
                    <Megaphone className="w-5 h-5 text-[#1E2566]" />
                  </div>
                  <h2 className="font-montserrat font-bold text-xl text-gray-800">Announcements</h2>
                </div>

                {announcementsLoading ? (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-8 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E2566] mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Loading announcements...</p>
                  </div>
                ) : announcements.length > 0 ? (
                  <div>
                    <div className="space-y-4">
                      {announcements.slice(0, 3).map((announcement, index) => {
                        const isExpanded = expandedAnnouncements.has(announcement.announcementId);
                        
                        return (
                          <motion.div
                            key={announcement.announcementId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 group"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
                                  <Megaphone className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-[#1E2566] transition-colors line-clamp-2">
                                    {announcement.title}
                                  </h4>
                                  <p className="text-[11px] md:text-xs text-gray-500 flex items-center mt-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span className="truncate">
                                      Posted by {announcement.postedBy} on {new Date(announcement.createdAt).toLocaleDateString()}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => toggleAnnouncementExpansion(announcement.announcementId)}
                                className="p-1.5 rounded-full hover:bg-white hover:bg-opacity-50 transition-all duration-200 group/toggle flex-shrink-0"
                                aria-label={isExpanded ? 'Collapse announcement' : 'Expand announcement'}
                                aria-expanded={isExpanded}
                                aria-controls={`announcement-content-${announcement.announcementId}`}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-[#1E2566] group-hover/toggle:text-[#2F87C3] transition-colors" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-[#1E2566] group-hover/toggle:text-[#2F87C3] transition-colors" />
                                )}
                              </button>
                            </div>
                            
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
                              <div className="pt-2">
                                <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {announcement.content}
                                </p>
                              </div>
                            </motion.div>
                            
                            {!isExpanded && (
                              <p className="text-xs md:text-sm text-gray-700 leading-relaxed line-clamp-2 md:line-clamp-3 group-hover:text-gray-800 transition-colors">
                                {announcement.content}
                              </p>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    {announcements.length > 3 && (
                      <div className="mt-5 text-center">
                        <button
                          onClick={() => router.push('/announcements')}
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                        >
                          <span>View All Announcements ({announcements.length})</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-8 text-center">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Megaphone className="w-10 h-10 text-[#1E2566]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No Announcements</h3>
                    <p className="text-gray-500 text-sm">There are no announcements at this time. Check back later!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* === MODALS SECTION === */}

        {showExistingRequestPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]"
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="existing-request-title"
            >
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-400 p-5 text-white">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white/20 p-2">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 id="existing-request-title" className="font-montserrat text-xl font-extrabold">
                      Finish this request first
                    </h2>
                    <p className="mt-1 text-sm font-medium text-amber-50">
                      You already have an unfinished document request from the document details page.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Current draft</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-800">
                    {documentDetailRequestDraft?.document?.name || 'Document request'}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                    Continue editing the current draft, or discard it to start a new dashboard request.
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      discardRequest();
                      setShowExistingRequestPrompt(false);
                      setShowRequestModal(true);
                    }}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:bg-red-100"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExistingRequestPrompt(false);
                      restoreRequest();
                    }}
                    className="inline-flex flex-[1.2] items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
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
