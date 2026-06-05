'use client';

import AdminDashboardPage from '@/features/admin/dashboard/AdminDashboardPage';

export default function SuperAdminDashboard() {
  return (
    <AdminDashboardPage
      apiBase="http://localhost:8080/api/superadmin"
      basePath="superadmin"
      allowedRoles={['SUPER_ADMIN']}
      redirectForRole={{ ADMIN: '/admin/dashboard' }}
      loadingText="Loading System..."
      roleLabel="Super Admin Panel"
      quickActionMode="superadmin"
    />
  );
}
