'use client';

import AdminDashboardPage from '@/features/admin/dashboard/AdminDashboardPage';

export default function SuperAdminDashboard() {
  return (
    <AdminDashboardPage
      apiBase={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/superadmin`}
      basePath="superadmin"
      allowedRoles={['SUPER_ADMIN']}
      redirectForRole={{ ADMIN: '/admin/dashboard' }}
      loadingText="Loading System..."
      roleLabel="Super Admin Panel"
      quickActionMode="superadmin"
    />
  );
}
