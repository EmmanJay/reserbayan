'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, ClipboardList, User, Plus, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle, X, Send, TrendingUp, Calendar, Bell } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRequests } from '@/hooks/useRequests';
import documentsData from '@/lib/data.json';

export default function DashboardPage() {
  const { user } = useUser();
  const { requests, loading, refetchRequests } = useRequests(user);
  const router = useRouter();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [formData, setFormData] = useState({
    purpose: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const recentRequests = useMemo(() => {
    return requests
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 3);
  }, [requests]);

  const requestStats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status?.toLowerCase() === 'pending').length;
    const approved = requests.filter(r => r.status?.toLowerCase() === 'approved').length;
    const completed = requests.filter(r => r.status?.toLowerCase() === 'completed').length;
    return { total, pending, approved, completed };
  }, [requests]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDocument || !formData.purpose.trim()) {
      alert('Please select a document and provide a purpose.');
      return;
    }

    const document = documentsData.find(doc => doc.id === selectedDocument);
    if (!document) {
      alert('Selected document not found.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        documentId: selectedDocument,
        documentName: document.name,
        residentId: user.residentId,
        details: formData.purpose,
      };

      const response = await fetch('http://localhost:8080/api/document-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Request submitted successfully!');
        setShowRequestModal(false);
        setSelectedDocument('');
        setFormData({ purpose: '' });
        refetchRequests(); // Refresh the requests data
      } else {
        const error = await response.text();
        alert('Error: ' + error);
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="pt-32 px-8 min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F5F7FA] pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="font-montserrat font-extrabold text-4xl md:text-5xl text-blue-900 mb-4">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
            Manage your document requests and explore available documents.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="font-montserrat font-bold text-3xl text-gray-800 mb-8">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowRequestModal(true)}
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
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
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
                    <div key={request.requestId} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
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
              <p className="text-gray-500 mb-8 text-lg">You haven't submitted any requests yet. Get started by requesting your first document!</p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Request Your First Document
              </button>
            </div>
          )}
        </div>

        {/* Request Form Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Request a Document</h2>
                    <p className="text-gray-600">Fill out the form below to submit your document request</p>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleRequestSubmit} className="space-y-8">
                  {/* Document Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      Select Document <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDocument}
                      onChange={(e) => setSelectedDocument(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200 bg-gray-50 focus:bg-white"
                      required
                    >
                      <option value="">Choose a document...</option>
                      {documentsData.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      Purpose of Request <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                      rows="4"
                      placeholder="Please describe why you need this document..."
                      required
                    />
                  </div>

                  {/* User Info Display */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium">{user.firstName} {user.middleName || ''} {user.lastName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 font-medium">{user.residentEmail}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <span className="ml-2 font-medium">{user.phoneNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Address:</span>
                        <span className="ml-2 font-medium">{user.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}