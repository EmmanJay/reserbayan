import AnnouncementsManagement from '@/features/admin/announcements/AnnouncementsManagementPage';

export default function SuperAdminAnnouncementsPage() {
  return (
    <AnnouncementsManagement
      apiBase=`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/superadmin`
      roleLabel="Super Admin"
    />
  );
}
