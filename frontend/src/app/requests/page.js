'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, SortAsc, SortDesc, Grid3X3, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useRequests } from '@/hooks/useRequests';
import RequestCard from '@/components/requests/RequestCard';
import RequestModal from '@/components/requests/RequestModal';
import RequestsList from '@/components/requests/RequestsList';

export default function RequestsPage() {
   const { user } = useUser();
   const { requests, loading, cancelRequest } = useRequests(user);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('card');
  const router = useRouter();

  const handleRequestClick = useCallback((request) => {
    setSelectedRequest(request);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const categories = useMemo(() => [
    { key: 'all', label: 'All Requests', count: requests.length },
    { key: 'pending', label: 'Pending', count: requests.filter(r => r.status?.toLowerCase() === 'pending').length },
    { key: 'approved', label: 'Approved', count: requests.filter(r => r.status?.toLowerCase() === 'approved').length },
    { key: 'completed', label: 'Completed', count: requests.filter(r => r.status?.toLowerCase() === 'completed').length },
    { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status?.toLowerCase() === 'rejected').length },
  ], [requests]);

  const filteredRequests = useMemo(() => {
    return requests
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
  }, [requests, selectedCategory, searchTerm, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" aria-hidden="true"></div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div
      className="pt-32 px-8 min-h-screen bg-[#FAFAFA] pb-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="font-montserrat font-extrabold text-4xl text-blue-900 mb-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          My Document Requests
        </motion.h1>

        {/* Category Filters */}
        <motion.div
          className="mb-6 flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Filter requests by status"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={selectedCategory === category.key}
              aria-label={`Filter by ${category.label.toLowerCase()}, ${category.count} requests`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </motion.div>

        {/* Search Bar and Controls */}
        <motion.div
          className="mb-8 mt-12 flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          {/* Search Bar on the left */}
          <div className="flex-1 max-w-none">
            <label htmlFor="search-requests" className="sr-only">Search requests</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
              <input
                id="search-requests"
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-describedby="search-help"
              />
            </div>
            <div id="search-help" className="sr-only">Search by document name, details, or request ID</div>
          </div>

          {/* View Toggle and Sort Controls on the right */}
          <div className="flex flex-wrap gap-6 items-center">
            <fieldset className="flex bg-gray-100 border border-gray-200 rounded-lg p-1">
              <legend className="sr-only">Choose view mode</legend>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'card'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                aria-pressed={viewMode === 'card'}
                aria-label="View as cards"
              >
                <Grid3X3 className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                aria-pressed={viewMode === 'list'}
                aria-label="View as list"
              >
                <List className="w-4 h-4 inline mr-1" aria-hidden="true" />
                List
              </button>
            </fieldset>

            <div className="flex gap-2 items-center">
              <label htmlFor="sort-by" className="text-sm text-gray-600 font-medium">Sort by:</label>
              <select
                id="sort-by"
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
                aria-label={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" aria-hidden="true" /> : <SortDesc className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md" role="status" aria-live="polite">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Requests Yet
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't submitted any document requests yet.
              </p>
              <button
                onClick={() => router.push('/documents')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Browse Documents
              </button>
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="grid" aria-label="Document requests in card view">
              {filteredRequests.map((request) => (
                <RequestCard key={request.requestId} request={request} onClick={handleRequestClick} />
              ))}
            </div>
          ) : (
            <RequestsList requests={filteredRequests} onRequestClick={handleRequestClick} />
          )}
        </motion.div>

        {/* Detailed View Modal */}
        {selectedRequest && (
          <RequestModal request={selectedRequest} user={user} onClose={handleCloseModal} cancelRequest={cancelRequest} />
        )}
      </div>
    </motion.div>
  );
}