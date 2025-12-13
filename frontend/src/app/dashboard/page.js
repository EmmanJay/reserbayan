'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Megaphone, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useRequests } from '@/hooks/useRequests';
import PendingRestrictionModal from '@/components/PendingRestrictionModal';
import RequestModal from '@/components/requests/RequestModal'; // Detail View
import RequestFormModal from '@/components/requests/RequestFormModal'; // Create View

export default function DashboardPage() {
  const { user } = useUser();
  const { requests, loading, refetchRequests, cancelRequest } = useRequests(user);
  const router = useRouter();
  
  // Modals state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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
      
      const response = await fetch('http://localhost:8080/api/residents/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const announcementsData = await response.json();
        setAnnouncements(announcementsData);
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to fetch announcements:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

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
                  {announcements.slice(0, 3).map((announcement, index) => (
                    <motion.div
                      key={announcement.announcementId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
                      onClick={() => setSelectedAnnouncement(announcement)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <Megaphone className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-[#1E2566] transition-colors">{announcement.title}</h4>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Posted by {announcement.postedBy} on {new Date(announcement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button className="text-[#1E2566] hover:text-[#2F87C3] transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-gray-700 leading-relaxed line-clamp-2 group-hover:text-gray-800 transition-colors">
                        {announcement.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
                {announcements.length > 3 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setSelectedAnnouncement({ viewAll: true })}
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
          ) : recentRequests.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-8">
                <div className="space-y-6">
                  {recentRequests.map((request, index) => (
                    <motion.div 
                      key={request.requestId} 
                      onClick={() => setViewRequest(request)}
                      className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
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
                <div className="mt-8 text-center">
                  <Link
                    href="/requests"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span>View All Requests</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">No Recent Activity</h3>
              <p className="text-gray-500 mb-8 text-lg">You havent submitted any requests yet. Get started by requesting your first document!</p>
              <button
                onClick={() => {
                  if (user.status === 'PENDING') {
                    setShowPendingModal(true);
                    return;
                  }
                  setShowRequestModal(true);
                }}
                className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Request Your First Document
              </button>
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

        {/* 4. ANNOUNCEMENT DETAIL MODAL */}
        {selectedAnnouncement && !selectedAnnouncement.viewAll && (
          <AnnouncementModal
            announcement={selectedAnnouncement}
            onClose={() => setSelectedAnnouncement(null)}
          />
        )}

        {/* 5. ALL ANNOUNCEMENTS MODAL */}
        {selectedAnnouncement && selectedAnnouncement.viewAll && (
          <AllAnnouncementsModal
            announcements={announcements}
            onClose={() => setSelectedAnnouncement(null)}
          />
        )}
      </div>
    </motion.div>
  );
}

// Announcement Detail Modal Component
function AnnouncementModal({ announcement, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white flex items-center justify-center shadow-lg">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{announcement.title}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Posted by {announcement.postedBy} on {new Date(announcement.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white hover:bg-opacity-80 rounded-full transition-all duration-200 group"
            >
              <XCircle className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <motion.div
            className="prose max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {announcement.content}
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-4 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-300"
            >
              Got it!
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// All Announcements Modal Component
function AllAnnouncementsModal({ announcements, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white flex items-center justify-center shadow-lg">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">All Announcements</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{announcements.length} announcements total</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white hover:bg-opacity-80 rounded-full transition-all duration-200 group"
            >
              <XCircle className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[70vh]">
          <div className="space-y-8">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.announcementId}
                className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white flex items-center justify-center shadow-md flex-shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-xl mb-2">{announcement.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Posted by {announcement.postedBy} on {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-blue-200">
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}