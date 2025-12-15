'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Filter, Edit, Trash2,
  Calendar, Clock, AlertCircle, CheckCircle, XCircle,
  Loader, Megaphone, Save, X, ArrowUp, ArrowDown, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementsManagement() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    priority: 'MEDIUM',
    isVisible: true
  });
  const [formLoading, setFormLoading] = useState(false);

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

  // Fetch all announcements
  const fetchAnnouncements = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
        setFilteredAnnouncements(data);
      } else {
        console.error('Failed to fetch announcements');
        showNotification('Failed to fetch announcements', 'error');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showNotification('Error connecting to server', 'error');
    }
  }, []);

  // Filter announcements based on search and filters
  useEffect(() => {
    let filtered = announcements;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.postedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(announcement => announcement.priority === priorityFilter);
    }

    // Status filter (Active/Inactive)
    if (statusFilter !== 'ALL') {
      const isActive = statusFilter === 'ACTIVE';
      filtered = filtered.filter(announcement => announcement.isActive === isActive);
    }

    // Visibility filter
    if (visibilityFilter !== 'ALL') {
      const isVisible = visibilityFilter === 'VISIBLE';
      filtered = filtered.filter(announcement => announcement.isVisible === isVisible);
    }

    setFilteredAnnouncements(filtered);
  }, [announcements, searchTerm, priorityFilter, statusFilter, visibilityFilter]);

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      startDate: '',
      endDate: '',
      priority: 'MEDIUM',
      isVisible: true
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Create new announcement
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      showNotification('Title and content are required', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const announcementData = {
        ...formData,
        postedBy: currentUser.firstName + ' ' + currentUser.lastName,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };

      const response = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(announcementData)
      });

      if (response.ok) {
        const newAnnouncement = await response.json();
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setShowCreateModal(false);
        resetForm();
        showNotification('Announcement created successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(errorData.error || 'Failed to create announcement', 'error');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      showNotification('Error connecting to server', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Update announcement
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      showNotification('Title and content are required', 'error');
      return;
    }

    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');
      
      const announcementData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };

      const response = await fetch(`${API_BASE}/announcements/${selectedAnnouncement.announcementId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(announcementData)
      });

      if (response.ok) {
        const updatedAnnouncement = await response.json();
        setAnnouncements(prev => 
          prev.map(ann => 
            ann.announcementId === updatedAnnouncement.announcementId ? updatedAnnouncement : ann
          )
        );
        setShowEditModal(false);
        setSelectedAnnouncement(null);
        resetForm();
        showNotification('Announcement updated successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(errorData.error || 'Failed to update announcement', 'error');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      showNotification('Error connecting to server', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete announcement
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/announcements/${selectedAnnouncement.announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAnnouncements(prev => 
          prev.filter(ann => ann.announcementId !== selectedAnnouncement.announcementId)
        );
        setShowDeleteModal(false);
        setSelectedAnnouncement(null);
        showNotification('Announcement deleted successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(errorData.error || 'Failed to delete announcement', 'error');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showNotification('Error connecting to server', 'error');
    }
  };


  // Open edit modal
  const openEditModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : '',
      endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : '',
      priority: announcement.priority,
      isVisible: announcement.isVisible
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteModal(true);
  };

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
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
      router.push('/');
      return;
    }

    setUser(storedUser);
    setLoading(false);
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
                <h1 className="text-2xl font-bold text-slate-900">Announcements Management</h1>
                <p className="text-slate-600">Create and manage announcements for residents</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md"
            >
              <Plus className="w-4 h-4" />
              New Announcement
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
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* Visibility Filter */}
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="ALL">All Visibility</option>
              <option value="VISIBLE">Visible</option>
              <option value="HIDDEN">Hidden</option>
            </select>
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
                className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <button
                        onClick={() => toggleExpanded(announcement.announcementId)}
                        className="flex items-center gap-3 mb-3 w-full text-left hover:bg-slate-50 -m-2 p-2 rounded-lg transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] rounded-full flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-5 h-5 text-white" />
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
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                        {announcement.isActive ? (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
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
                        {announcement.content.length > 200
                          ? `${announcement.content.substring(0, 200)}...`
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

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(announcement)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Post
                    </button>
                    <button
                      onClick={() => openDeleteModal(announcement)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No announcements found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || priorityFilter !== 'ALL' || statusFilter !== 'ALL' || visibilityFilter !== 'ALL'
                ? 'Try adjusting your search criteria'
                : 'Create your first announcement to get started'
              }
            </p>
            {!searchTerm && priorityFilter === 'ALL' && statusFilter === 'ALL' && visibilityFilter === 'ALL' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Create Announcement
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900">
                    {showCreateModal ? 'Create New Announcement' : 'Edit Announcement'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedAnnouncement(null);
                      resetForm();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="p-6">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                      placeholder="Write your announcement content here..."
                      required
                    />
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Priority and Visibility */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          name="isVisible"
                          checked={formData.isVisible}
                          onChange={handleInputChange}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Visible to residents
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedAnnouncement(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading || !formData.title.trim() || !formData.content.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        {showCreateModal ? 'Creating...' : 'Updating...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {showCreateModal ? 'Create Announcement' : 'Update Announcement'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedAnnouncement && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Announcement</h3>
                </div>
                
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete the announcement "{selectedAnnouncement.title}"? 
                  This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedAnnouncement(null);
                    }}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}