'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, Calendar, Clock, AlertCircle, CheckCircle, 
  Loader, Megaphone, ChevronDown, ChevronUp, ChevronLeft, 
  ChevronRight, XCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [pageSize] = useState(5); // Show 5 announcements per page
  const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // API base URL
  const API_BASE = 'http://localhost:8080/api/residents';

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

  // Fetch announcements with pagination and filters
  const fetchAnnouncements = useCallback(async (page = 0, append = false) => {
    try {
      setError(null);
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString()
      });

      // Add filters if they exist
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);

      console.log('Fetching announcements from:', `${API_BASE}/announcements?${params}`);

      const response = await fetch(`${API_BASE}/announcements?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Announcements response:', data);
        
        if (append) {
          setAnnouncements(prev => [...prev, ...data.announcements]);
        } else {
          setAnnouncements(data.announcements || []);
        }
        
        setCurrentPage(data.currentPage || 0);
        setTotalPages(data.totalPages || 0);
        setTotalItems(data.totalItems || 0);
        setHasNext(data.hasNext || false);
        setHasPrevious(data.hasPrevious || false);
        
        // Set filtered announcements directly from API response
        const filtered = data.announcements || [];
        setFilteredAnnouncements(filtered);
      } else if (response.status === 401) {
        // Token expired or invalid
        console.log('Token expired, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('role');
        router.push('/');
        return;
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        setError(`Failed to fetch announcements (${response.status}). Please try again later.`);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Unable to connect to the server. Please check if the backend is running.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [router, searchTerm, priorityFilter, pageSize]);

  // Load more announcements
  const loadMore = () => {
    if (hasNext && !loadingMore) {
      fetchAnnouncements(currentPage + 1, true);
    }
  };

  // Refresh announcements
  const refreshAnnouncements = () => {
    fetchAnnouncements(0, false);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
    setAnnouncements([]);
    setFilteredAnnouncements([]);
    fetchAnnouncements(0, false);
  }, [searchTerm, priorityFilter, fetchAnnouncements]);

  // Toggle announcement expanded state
  const toggleExpanded = (announcementId) => {
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'URGENT': return <AlertCircle className="w-4 h-4" />;
      case 'HIGH': return <AlertCircle className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  // Check if announcement is expired
  const isExpired = (announcement) => {
    if (!announcement.endDate) return false;
    return new Date(announcement.endDate) < new Date();
  };

  // Check if announcement is upcoming
  const isUpcoming = (announcement) => {
    if (!announcement.startDate) return false;
    return new Date(announcement.startDate) > new Date();
  };

  // Check if announcement is currently active
  const isActive = (announcement) => {
    if (!announcement.startDate && !announcement.endDate) return true;
    
    const now = new Date();
    const startDate = announcement.startDate ? new Date(announcement.startDate) : null;
    const endDate = announcement.endDate ? new Date(announcement.endDate) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || (role !== 'RESIDENT' && role !== 'ADMIN')) {
      router.push('/');
      return;
    }

    setUser(storedUser);
    fetchAnnouncements();
  }, [router, fetchAnnouncements]);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
          <p className="text-slate-500 font-medium text-sm">Loading Announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
                <p className="text-slate-600">Stay updated with the latest barangay news and information</p>
              </div>
            </div>
            <button
              onClick={refreshAnnouncements}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Notification Toast */}
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
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search announcements by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing {filteredAnnouncements.length} of {totalItems} announcements
              {searchTerm && ` for "${searchTerm}"`}
              {priorityFilter !== 'ALL' && ` with ${priorityFilter.toLowerCase()} priority`}
            </p>
          </div>
        </div>

        {/* Announcements Posts */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredAnnouncements.map((announcement) => (
              <motion.div
                key={announcement.announcementId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                  !isActive(announcement) ? 'opacity-75' : ''
                }`}
              >
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <button
                        onClick={() => toggleExpanded(announcement.announcementId)}
                        className="flex items-center gap-3 mb-3 w-full text-left hover:bg-slate-50 -m-2 p-2 rounded-lg transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          announcement.priority === 'URGENT' ? 'bg-red-500' :
                          announcement.priority === 'HIGH' ? 'bg-orange-500' :
                          announcement.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          <div className="text-white">
                            {getPriorityIcon(announcement.priority)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-xl leading-tight">
                            {announcement.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-slate-500">Posted by {announcement.postedBy}</span>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-sm text-slate-500">{formatDate(announcement.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 bg-slate-100 rounded-full p-1">
                          {expandedAnnouncements.has(announcement.announcementId) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </button>
                      
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                        
                        {/* Status indicators */}
                        {isUpcoming(announcement) && (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            Upcoming
                          </span>
                        )}
                        {isExpired(announcement) && (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                            Expired
                          </span>
                        )}
                        {isActive(announcement) && !isUpcoming(announcement) && !isExpired(announcement) && (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <div className="prose prose-slate max-w-none">
                    {expandedAnnouncements.has(announcement.announcementId) ? (
                      <div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-700 leading-relaxed">
                        {announcement.content.length > 300
                          ? `${announcement.content.substring(0, 300)}...`
                          : announcement.content
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Post Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  {/* Date Range */}
                  {(announcement.startDate || announcement.endDate) && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Validity Period:</span>
                      <span>
                        {announcement.startDate ? formatDate(announcement.startDate) : 'No start date'}
                        {' to '}
                        {announcement.endDate ? formatDate(announcement.endDate) : 'No end date'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {hasNext && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Loading more...
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4" />
                  Load More Announcements
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredAnnouncements.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm || priorityFilter !== 'ALL' ? 'No matching announcements' : 'No announcements available'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || priorityFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filters'
                : 'There are no announcements at the moment. Check back later for updates.'
              }
            </p>
            {(searchTerm || priorityFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPriorityFilter('ALL');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Clear Filters
              </button>
            )}
            {!searchTerm && priorityFilter === 'ALL' && (
              <button
                onClick={refreshAnnouncements}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}