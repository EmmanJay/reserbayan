'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, FileText, Trash2, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ManageResidentPage() {
  const router = useRouter();
  const params = useParams();
  const residentId = params.id;

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [residentLoading, setResidentLoading] = useState(true);
  const [error, setError] = useState(null);

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

    fetchResident();
  }, [router, residentId]);

  const fetchResident = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/superadmin/residents/${residentId}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch resident');
      const data = await response.json();
      setResident(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setResidentLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resident? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/superadmin/residents/${residentId}`, {
        method: 'DELETE',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to delete resident');
      alert('Resident deleted successfully');
      router.push('/superadmin/management');
    } catch (err) {
      alert('Error deleting resident: ' + err.message);
    }
  };

  const handlePasswordReset = async () => {
    const newPassword = prompt('Enter new password for the resident:');
    if (!newPassword) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/superadmin/residents/${residentId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!response.ok) throw new Error('Failed to reset password');
      alert('Password reset successfully');
    } catch (err) {
      alert('Error resetting password: ' + err.message);
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

  if (residentLoading) {
    return (
      <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resident details...</p>
        </div>
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div className="pt-24 px-8 min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error || 'Resident not found'}</p>
          <Link
            href="/superadmin/management"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Management
          </Link>
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
        className="mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <Link
          href="/superadmin/management"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Management
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Manage Resident</h1>
        <p className="text-gray-600">View and manage resident information</p>
      </motion.div>

      {/* Resident Details Card */}
      <motion.div
        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {resident.firstName} {resident.middleName} {resident.lastName}
            </h2>
            <p className="text-gray-600">Resident ID: {resident.residentId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{resident.residentEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-900">{resident.phoneNumber || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{resident.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Birthdate</p>
                <p className="font-medium text-gray-900">
                  {resident.birthdate ? new Date(resident.birthdate).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Valid ID Path</p>
                <p className="font-medium text-gray-900">{resident.validIdPath || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium text-gray-900">
                  {new Date(resident.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        <button
          onClick={handlePasswordReset}
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
        >
          <Key size={18} />
          Reset Password
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Trash2 size={18} />
          Delete Resident
        </button>
      </motion.div>
    </motion.div>
  );
}