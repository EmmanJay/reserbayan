'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ViewAllResidentsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);
  const [residentsLoading, setResidentsLoading] = useState(true);
  const [selectedResident, setSelectedResident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
  }, [router]);

  const filteredResidents = residents.filter((resident) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      resident.firstName?.toLowerCase().includes(query) ||
      resident.lastName?.toLowerCase().includes(query) ||
      resident.residentEmail?.toLowerCase().includes(query) ||
      resident.phoneNumber?.toLowerCase().includes(query) ||
      resident.address?.toLowerCase().includes(query) ||
      resident.birthdate?.toLowerCase().includes(query) ||
      resident.validIdPath?.toLowerCase().includes(query)
    );
  });

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
      setResidents(data);
      if (data.length > 0) {
        setSelectedResident(data[0]);
      }
    } catch (err) {
      console.error('Error fetching residents:', err);
    } finally {
      setResidentsLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">All Residents</h1>
        <p className="text-gray-600">View detailed information for all residents</p>
      </motion.div>

      {residentsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading residents...</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Residents ({filteredResidents.length})</h2>

            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search residents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Search by name, email, phone, address, birthdate, or ID path
              </p>
            </div>

            <div className="space-y-2">
              {filteredResidents.map((resident) => (
                <button
                  key={resident.residentId}
                  onClick={() => setSelectedResident(resident)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedResident?.residentId === resident.residentId
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {resident.firstName} {resident.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{resident.residentEmail}</p>
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
            {selectedResident ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#1E2566] to-[#2F87C3] text-white rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedResident.firstName} {selectedResident.middleName} {selectedResident.lastName}
                    </h2>
                    <p className="text-gray-600">Resident ID: {selectedResident.residentId}</p>
                  </div>
                  <div className="ml-auto">
                    <Link
                      href={`/superadmin/management/residents/${selectedResident.residentId}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{selectedResident.residentEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium text-gray-900">{selectedResident.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-gray-900">{selectedResident.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Birthdate</p>
                        <p className="font-medium text-gray-900">
                          {selectedResident.birthdate ? new Date(selectedResident.birthdate).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Valid ID Path</p>
                        <p className="font-medium text-gray-900">{selectedResident.validIdPath || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedResident.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Select a resident to view details</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}