'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
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

  const recentRequests = useMemo(() => {
    return requests
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 3);
  }, [requests]);

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
            Manage your document requests and explore available documents.
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

        {/* Recent Activity */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
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
                    <div 
                      key={request.requestId} 
                      onClick={() => setViewRequest(request)}
                      className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
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
                    </div>
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
      </div>
    </motion.div>
  );
}