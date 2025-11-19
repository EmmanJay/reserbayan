'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

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

              <InfoItem icon={<User />} label="Full Name" value={`${user.firstName} ${user.middleName || ''} ${user.lastName}`} />
              <InfoItem icon={<Mail />} label="Email" value={user.residentEmail || 'Not provided'} />
              <InfoItem icon={<Phone />} label="Phone Number" value={user.phoneNumber || 'Not provided'} />
              <InfoItem icon={<MapPin />} label="Address" value={user.address || 'Not provided'} />
              <InfoItem icon={<Calendar />} label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'} />
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
