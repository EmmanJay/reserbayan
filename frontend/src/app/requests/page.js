'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Calendar, CheckCircle, Clock, XCircle, Eye, Filter, Search, SortAsc, SortDesc, Grid3X3, List } from 'lucide-react';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('card');
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      alert('Please login first');
      window.dispatchEvent(new CustomEvent('showLogin'));
      setLoading(false);
      return;
    }

    setUser(storedUser);

    const fetchRequests = async () => {
      try {
        console.log('Fetching requests for residentId:', storedUser.residentId);
        const response = await fetch(`http://localhost:8080/api/document-requests/resident/${storedUser.residentId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched requests:', data);
          setRequests(data);
        } else {
          console.error('Failed to fetch requests:', response.status, response.statusText);
          alert('Failed to load requests. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        alert('Network error. Please check if the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusIcon = (status) => {
    const statusLower = status ? status.toLowerCase() : '';
    switch (statusLower) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status ? status.toLowerCase() : '';
    switch (statusLower) {
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'completed':
        return 'text-blue-700 bg-blue-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'rejected':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const categories = [
    { key: 'all', label: 'All Requests', count: requests.length },
    { key: 'pending', label: 'Pending', count: requests.filter(r => r.status?.toLowerCase() === 'pending').length },
    { key: 'approved', label: 'Approved', count: requests.filter(r => r.status?.toLowerCase() === 'approved').length },
    { key: 'completed', label: 'Completed', count: requests.filter(r => r.status?.toLowerCase() === 'completed').length },
    { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status?.toLowerCase() === 'rejected').length },
  ];

  const filteredRequests = requests
    .filter(r => selectedCategory === 'all' || r.status?.toLowerCase() === selectedCategory)
    .filter(r =>
      searchTerm === '' ||
      r.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requestId?.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      let aValue, bValue;
      if (sortBy === 'submittedAt') {
        aValue = new Date(a.submittedAt);
        bValue = new Date(b.submittedAt);
      } else if (sortBy === 'status') {
        aValue = a.status?.toLowerCase() || '';
        bValue = b.status?.toLowerCase() || '';
      } else if (sortBy === 'documentName') {
        aValue = a.documentName?.toLowerCase() || '';
        bValue = b.documentName?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="pt-32 px-8 min-h-screen bg-[#FAFAFA] pb-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-montserrat font-extrabold text-4xl text-blue-900 mb-8 text-center">
          My Document Requests
        </h1>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* View Toggle and Sort Controls */}
        <div className="mb-8 flex flex-wrap justify-center gap-6 items-center">
          <div className="flex bg-gray-100 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid3X3 className="w-4 h-4 inline mr-1" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="w-4 h-4 inline mr-1" />
              List
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="submittedAt">Date</option>
              <option value="status">Status</option>
              <option value="documentName">Document</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Requests Yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't submitted any document requests yet.
            </p>
            <button
              onClick={() => router.push('/documents')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse Documents
            </button>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRequests.map((request) => (
              <div
                key={request.requestId}
                onClick={() => setSelectedRequest(request)}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden relative"
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-sm">
                        <FileText className="w-6 h-6 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="font-montserrat font-bold text-lg text-blue-900 group-hover:text-blue-800 transition-colors line-clamp-1">
                          {request.documentName}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">ID: #{request.requestId}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {getStatusIcon(request.status)}
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(request.status)} shadow-sm`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {new Date(request.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="text-gray-700">
                      <p className="text-sm font-semibold mb-2 text-blue-900">Purpose:</p>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200/50">
                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{request.details}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.requestId}
                      onClick={() => setSelectedRequest(request)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{request.documentName}</div>
                            <div className="text-sm text-gray-500">ID: #{request.requestId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(request.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs truncate">{request.details}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed View Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="font-montserrat font-bold text-2xl text-blue-900">
                      Request Details
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Status Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(selectedRequest.status)}
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Current Status</p>
                        <p className="text-lg font-bold text-blue-900">{selectedRequest.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-700">Request ID</p>
                      <p className="text-lg font-bold text-blue-900">#{selectedRequest.requestId}</p>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Document Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Document Name</p>
                          <p className="text-gray-900 font-semibold">{selectedRequest.documentName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Document ID</p>
                          <p className="text-gray-900">{selectedRequest.documentId}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Timeline
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-green-800">Submitted</p>
                            <p className="text-xs text-green-600">{new Date(selectedRequest.submittedAt).toLocaleString('en-US')}</p>
                          </div>
                        </div>
                        {selectedRequest.updatedAt && (
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-blue-800">Last Updated</p>
                              <p className="text-xs text-blue-600">{new Date(selectedRequest.updatedAt).toLocaleString('en-US')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4">Purpose & Details</h3>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{selectedRequest.details}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-4">Additional Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p className="text-sm"><span className="font-medium">Resident ID:</span> {user?.residentId}</p>
                        <p className="text-sm"><span className="font-medium">Submitted Date:</span> {new Date(selectedRequest.submittedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}