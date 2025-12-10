'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Clock, Edit, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [editing, setEditing] = useState(false);
   const [formData, setFormData] = useState({});
   const [saving, setSaving] = useState(false);
   const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      residentId: parsedUser.residentId,
      firstName: parsedUser.firstName || '',
      lastName: parsedUser.lastName || '',
      middleName: parsedUser.middleName || '',
      residentEmail: parsedUser.residentEmail || '',
      phoneNumber: parsedUser.phoneNumber || '',
      address: parsedUser.address || '',
      birthdate: parsedUser.birthdate ? parsedUser.birthdate.split('T')[0] : ''
    });
    setLoading(false);
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Error updating profile: ' + result.message);
      }
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      residentId: user.residentId,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      middleName: user.middleName || '',
      residentEmail: user.residentEmail || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      birthdate: user.birthdate ? user.birthdate.split('T')[0] : ''
    });
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E2566] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pt-32"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-5xl mx-auto px-4 pb-12">

        {/* Profile Header */}
        <motion.div
          className="bg-white shadow-lg rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <div className="bg-gradient-to-r from-[#1E2566] to-[#2F87C3] p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full bg-white shadow-md flex justify-center items-center overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-[#1E2566]" />
                  )}
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-blue-100 mt-1 text-sm">Resident Account</p>
                </div>
              </div>

              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-white text-[#1E2566] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        {/* Content */}
        <motion.div
          className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >

            {/* Personal Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Personal Information</h2>

              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="residentEmail"
                      value={formData.residentEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <InfoItem icon={<User />} label="Full Name" value={`${user.firstName} ${user.middleName || ''} ${user.lastName}`} />
                  <InfoItem icon={<Mail />} label="Email" value={user.residentEmail || 'Not provided'} />
                  <InfoItem icon={<Phone />} label="Phone Number" value={user.phoneNumber || 'Not provided'} />
                  <InfoItem icon={<MapPin />} label="Address" value={user.address || 'Not provided'} />
                  <InfoItem icon={<Calendar />} label="Date of Birth" value={user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'Not provided'} />
                </>
              )}
            </div>

            {/* Account Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Account Information</h2>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium text-gray-900">Account Status</h3>
                <p className="text-green-600 font-semibold mt-1">Active</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border mt-4">
                <h3 className="font-medium text-gray-900">Member Since</h3>
                <p className="text-gray-700 mt-1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border mt-4">
                <h3 className="font-medium text-gray-900">Last Login</h3>
                <p className="text-gray-700 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" /> Recent
                </p>
              </div>
            </div>
       </motion.div>
     </div>
   </motion.div>
 );
}

/* Reusable Information Row */
function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start space-x-3 mb-4">
      <div className="text-gray-400 mt-1">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}
