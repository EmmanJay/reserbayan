'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [router]);

  if (!user || loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Coming soon...</h1>
        <p className="text-gray-600">The superadmin dashboard is under development.</p>
      </div>
    </div>
  );
}