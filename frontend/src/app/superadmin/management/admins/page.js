'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Mail, Phone, MapPin, User, Briefcase, FileText, Plus, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ViewAllAdminsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [addAdminModal, setAddAdminModal] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [passwordModal, setPasswordModal] = useState(null);
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [verifiedAdmins, setVerifiedAdmins] = useState(new Set()); // Track which admins have verified passwords
  const [verificationMessage, setVerificationMessage] = useState('');
  const [messageModal, setMessageModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempAdmin, setTempAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }

    setUser(user);
    setRole(role);
    setLoading(false);

    fetchAdmins();
  }, [router]);

  // Debug search query changes
  useEffect(() => {
    if (searchQuery && searchQuery !== '') {
      console.log('Search query changed to:', searchQuery);
    }
  }, [searchQuery]);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/superadmin/admins', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch admins');
      const data = await response.json();
      setAdmins(data);
      if (data.length > 0) {
        setSelectedAdmin(data[0]);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setAdminsLoading(false);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      admin.firstName?.toLowerCase().includes(query) ||
      admin.lastName?.toLowerCase().includes(query) ||
      admin.username?.toLowerCase().includes(query) ||
      admin.residentEmail?.toLowerCase().includes(query) ||
      admin.phoneNumber?.toLowerCase().includes(query) ||
      admin.address?.toLowerCase().includes(query) ||
      admin.position?.toLowerCase().includes(query) ||
      admin.role?.toLowerCase().includes(query)
    );
  });

  const handleAddAdmin = async () => {
    if (!newAdminUsername.trim()) {
      alert('Please enter a username');
      return;
    }

    const newAdmin = {
      username: newAdminUsername.trim(),
      password: 'Admin123',
      role: 'ADMIN',
      firstName: newAdminUsername.trim(),
      middleName: '',
      lastName: '',
      residentEmail: `${newAdminUsername.trim()}@reserbayan.com`,
      phoneNumber: '',
      address: '',
      position: '',
      proofOfEmploymentPath: ''
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/superadmin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newAdmin),
      });
      if (!response.ok) throw new Error('Failed to add admin');

      // Refresh the admins list
      await fetchAdmins();

      alert('Administrator added successfully with default password: Admin123');
      setAddAdminModal(false);
      setNewAdminUsername('');
    } catch (err) {
      alert('Error adding administrator: ' + err.message);
    }
  };

  const handleShowPassword = (admin) => {
    // If already verified, allow toggling visibility off
    if (verifiedAdmins.has(admin.residentId)) {
      setVerifiedAdmins(prev => {
        const newSet = new Set(prev);
        newSet.delete(admin.residentId);
        return newSet;
      });
      return;
    }
    setPasswordModal(admin);
    setSuperAdminPassword('');
    setSearchQuery(''); // Clear search to prevent autofill issues
  };

  const handleSaveChanges = async () => {
    if (!tempAdmin) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/superadmin/admins/${tempAdmin.residentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(tempAdmin),
      });
      if (!response.ok) throw new Error('Failed to update admin');
      const updatedAdmin = await response.json();
      await fetchAdmins();
      setSelectedAdmin(updatedAdmin);
      setIsEditing(false);
      setTempAdmin(null);
    } catch (err) {
      alert('Error updating admin: ' + err.message);
    }
  };

  const handleVerifyPassword = async () => {
    if (!superAdminPassword.trim()) {
      alert('Please enter your password');
      return;
    }

    console.log('Attempting password verification...');

    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');

      // First test if backend is reachable
      console.log('Testing backend connectivity...');
      const testResponse = await fetch('http://localhost:8080/api/superadmin/admins', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      console.log('Test response status:', testResponse.status);

      const response = await fetch('http://localhost:8080/api/superadmin/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: superAdminPassword }),
      });

      console.log('Verify password response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        alert('Server error: ' + response.status + ' - ' + response.statusText + '\n\nDetails: ' + errorText);
        return;
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.valid) {
        console.log('Password verified successfully');
        // Add this admin to the verified set
        setVerifiedAdmins(prev => new Set([...prev, passwordModal.residentId]));
        setVerificationMessage('Password verified successfully! The admin password is now visible');
        setMessageModal(true);
        // Close modals after successful verification
        setTimeout(() => {
          setMessageModal(false);
          setPasswordModal(null);
          setSuperAdminPassword('');
        }, 2000);
      } else {
        console.log('Password verification failed');
        setVerificationMessage('Incorrect password. Please enter your actual Super Admin login password.');
        setMessageModal(true);
        setSuperAdminPassword('');
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Network error: ' + err.message + '\n\nTroubleshooting steps:\n1. Ensure backend server is running: cd backend && mvn spring-boot:run\n2. Check if you are logged in as Super Admin\n3. Verify network connectivity\n4. Check browser console for more details');
    }
  };

  if (!user || loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="pt-24 px-8 min-h-screen bg-[#FAFAFA] pb-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        className="mb-8 relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl -z-10"></div>
        <Link
          href="/superadmin/management"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 relative z-10"
        >
          <ArrowLeft size={16} />
          Back to Management
        </Link>
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Administrators</h1>
              <p className="text-gray-600">View detailed information for all administrators</p>
            </div>
          </div>
          <button
            onClick={() => setAddAdminModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus size={18} />
            Add Administrator
          </button>
        </div>
        <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-4 relative z-10"></div>
      </motion.div>

      {adminsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading administrators...</p>
        </div>
      ) : (
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <motion.div
            className="w-80 bg-white rounded-xl shadow-md border border-gray-200 p-4 overflow-y-auto"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Administrators ({filteredAdmins.length})</h2>

            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => {
                  console.log('Search query changing from:', searchQuery, 'to:', e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                autoComplete="off"
                name="admin-search"
              />
              <p className="text-xs text-gray-500 mt-1">
                Search by name, username, email, phone, address, position, or role
              </p>
            </div>

            <div className="space-y-2">
              {filteredAdmins.map((admin) => (
                <button
                  key={admin.residentId}
                  onClick={() => {
                    setSelectedAdmin(admin);
                    setVerifiedAdmins(new Set()); // Clear verification when switching admins
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedAdmin?.residentId === admin.residentId
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {admin.firstName} {admin.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{admin.residentEmail}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Details Panel */}
          <motion.div
            className="flex-1 bg-white rounded-xl shadow-md border border-gray-200 p-6 overflow-y-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            {selectedAdmin ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={tempAdmin?.firstName || ''}
                          onChange={(e) => setTempAdmin({ ...tempAdmin, firstName: e.target.value })}
                          placeholder="First Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={tempAdmin?.middleName || ''}
                          onChange={(e) => setTempAdmin({ ...tempAdmin, middleName: e.target.value })}
                          placeholder="Middle Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={tempAdmin?.lastName || ''}
                          onChange={(e) => setTempAdmin({ ...tempAdmin, lastName: e.target.value })}
                          placeholder="Last Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedAdmin.firstName} {selectedAdmin.middleName} {selectedAdmin.lastName}
                      </h2>
                    )}
                    <p className="text-gray-600">Admin ID: {selectedAdmin.residentId}</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setTempAdmin({ ...selectedAdmin });
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Email</p>
                        {isEditing ? (
                          <input
                            type="email"
                            value={tempAdmin?.residentEmail || ''}
                            onChange={(e) => setTempAdmin({ ...tempAdmin, residentEmail: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedAdmin.residentEmail}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Username</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempAdmin?.username || ''}
                            onChange={(e) => setTempAdmin({ ...tempAdmin, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedAdmin.username}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 text-gray-400 flex items-center justify-center">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Password</p>
                            {isEditing ? (
                              <input
                                type="text"
                                value={tempAdmin?.password || ''}
                                onChange={(e) => setTempAdmin({ ...tempAdmin, password: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                              />
                            ) : verifiedAdmins.has(selectedAdmin.residentId) ? (
                              <p className="font-medium text-gray-900 font-mono">{selectedAdmin.password || 'Not set'}</p>
                            ) : (
                              <p className="font-medium text-gray-900">••••••••</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleShowPassword(selectedAdmin)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title={verifiedAdmins.has(selectedAdmin.residentId) ? "Hide password" : "Show password (requires verification)"}
                          >
                            {verifiedAdmins.has(selectedAdmin.residentId) ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="font-medium text-gray-900">{selectedAdmin.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Phone Number</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempAdmin?.phoneNumber || ''}
                            onChange={(e) => setTempAdmin({ ...tempAdmin, phoneNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedAdmin.phoneNumber || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Address</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempAdmin?.address || ''}
                            onChange={(e) => setTempAdmin({ ...tempAdmin, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedAdmin.address || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Position</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempAdmin?.position || ''}
                            onChange={(e) => setTempAdmin({ ...tempAdmin, position: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedAdmin.position || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Proof of Employment</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempAdmin?.proofOfEmploymentPath || ''}
                            onChange={(e) => setTempAdmin({ ...tempAdmin, proofOfEmploymentPath: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{selectedAdmin.proofOfEmploymentPath || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 text-gray-400">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedAdmin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSaveChanges}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setTempAdmin(null);
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Select an administrator to view details</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Add Admin Modal */}
      {addAdminModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add New Administrator</h3>
                  <p className="text-sm text-gray-600">Create a new admin account</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Default Settings:</strong>
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Password: Admin123 (can be changed later)
                  </p>
                  <p className="text-sm text-blue-700">
                    Name: {newAdminUsername} (can be updated later)
                  </p>
                  <p className="text-sm text-blue-700">
                    Email: {newAdminUsername}@reserbayan.com (temporary)
                  </p>
                  <p className="text-sm text-blue-700">
                    Role: ADMIN
                  </p>
                  <p className="text-sm text-blue-700">
                    Other info: Empty (can be filled later)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddAdmin}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Administrator
                </button>
                <button
                  onClick={() => {
                    setAddAdminModal(false);
                    setNewAdminUsername('');
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Password Verification Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Verify Identity</h3>
                  <p className="text-sm text-gray-600">Enter your password to view admin credentials</p>
                </div>
              </div>

              <form autoComplete="off">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Password *
                    </label>
                    <input
                      type="password"
                      value={superAdminPassword}
                      onChange={(e) => setSuperAdminPassword(e.target.value)}
                      placeholder="Enter your superadmin password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                      autoComplete="new-password"
                      name="superadmin-password"
                    />
                  </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Security Notice:</strong> You are attempting to view sensitive password information.
                    This action requires verification of your superadmin credentials.
                  </p>
                </div>
              </div>
              </form>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleVerifyPassword}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Verify & Show Password
                </button>
                <button
                  onClick={() => setPasswordModal(null)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Verification Message Modal */}
      {messageModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Verification Result</h3>
                  <p className="text-sm text-gray-600">{verificationMessage}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setMessageModal(false)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}