'use client';

import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  return (
    <motion.div
      className="pt-32 px-8 min-h-screen bg-[#FAFAFA] pb-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="font-montserrat font-extrabold text-4xl text-blue-900 mb-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          Notifications
        </motion.h1>

        <motion.div
          className="bg-white rounded-xl shadow-md p-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No New Notifications</h3>
          <p className="text-gray-500">You don't have any notifications at the moment.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}