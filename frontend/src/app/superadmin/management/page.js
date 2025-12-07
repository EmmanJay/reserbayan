'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Shield, Eye, Settings, Trash2, Key, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SuperAdminManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [residentsLoading, setResidentsLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [manageModal, setManageModal] = useState(null);
  const [manageType, setManageType] = useState(null); // 'resident' or 'admin'
  const [addAdminModal, setAddAdminModal] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');

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

    fetchResidents();
    fetchAdmins();
  }, [router]);

  const fetchResidents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/superadmin/residents', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch residents');
      const data = await response.json();
      setResidents(data.slice(0, 10)); // Show only first 10
    } catch (err) {
      console.error('Error fetching residents:', err);
    } finally {
      setResidentsLoading(false);
    }
  };

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
      setAdmins(data.slice(0, 10)); // Show only first 10
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleManage = (type, item) => {
    setManageType(type);
    setManageModal(item);
  };

  const handleDelete = async () => {
    if (!manageModal) return;

    const endpoint = manageType === 'resident' ? 'residents' : 'admins';
    const confirmMessage = `Are you sure you want to delete this ${manageType}? This action cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}/${manageModal.residentId}`, {
        method: 'DELETE',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to delete');

      // Remove from local state
      if (manageType === 'resident') {
        setResidents(residents.filter(r => r.residentId !== manageModal.residentId));
      } else {
        setAdmins(admins.filter(a => a.residentId !== manageModal.residentId));
      }

      alert(`${manageType.charAt(0).toUpperCase() + manageType.slice(1)} deleted successfully`);
      setManageModal(null);
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!manageModal) return;

    const newPassword = prompt(`Enter new password for ${manageModal.firstName} ${manageModal.lastName}:`);
    if (!newPassword) return;

    const endpoint = manageType === 'resident' ? 'residents' : 'admins';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/superadmin/${endpoint}/${manageModal.residentId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!response.ok) throw new Error('Failed to reset password');

      alert('Password reset successfully');
      setManageModal(null);
    } catch (err) {
      alert('Error resetting password: ' + err.message);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminUsername.trim()) {
      alert('Please enter a username');
      return;
    }

    const newAdmin = {
      username: newAdminUsername.trim(),
      password: 'Admin123',
      role: 'ADMIN',
      status: 'ACTIVE',
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

  if (!user || loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading management panel...</p>
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
        className="mb-8 text-center relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl -z-10"></div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Oversee and manage all residents and administrators in the system.
          View recent users, reset passwords, delete accounts, or explore detailed management options.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-4"></div>
      </motion.div>

      {/* Main Content - Flex Layout */}
      <div className="flex gap-8">
        {/* Residents Section */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Residents</h2>
            </div>
            <Link
              href="/superadmin/management/residents"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Eye size={16} />
              View All
            </Link>
          </div>

          {residentsLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading residents...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {residents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">No residents found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {residents.map((resident) => (
                    <div key={resident.residentId} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {resident.firstName} {resident.middleName} {resident.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{resident.residentEmail}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleManage('resident', resident)}
                        className="text-gray-600 hover:text-gray-800 p-1"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Admins Section */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Administrators</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAddAdminModal(true)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
              >
                <Plus size={14} />
                Add Admin
              </button>
              <Link
                href="/superadmin/management/admins"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <Eye size={16} />
                View All
              </Link>
            </div>
          </div>

          {adminsLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading administrators...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {admins.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">No administrators found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {admins.map((admin) => (
                    <div key={admin.residentId} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {admin.firstName} {admin.middleName} {admin.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{admin.residentEmail}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleManage('admin', admin)}
                        className="text-gray-600 hover:text-gray-800 p-1"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

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
                    Role: ADMIN, Status: ACTIVE
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

      {/* Management Modal */}
      {manageModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  manageType === 'resident' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {manageType === 'resident' ? (
                    <Users className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Shield className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage {manageType === 'resident' ? 'Resident' : 'Administrator'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {manageModal.firstName} {manageModal.middleName} {manageModal.lastName}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePasswordReset}
                  className="w-full bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
                >
                  <Key size={18} />
                  <span className="font-medium">Reset Password</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full bg-red-50 text-red-700 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-3"
                >
                  <Trash2 size={18} />
                  <span className="font-medium">Delete {manageType === 'resident' ? 'Resident' : 'Administrator'}</span>
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setManageModal(null)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}