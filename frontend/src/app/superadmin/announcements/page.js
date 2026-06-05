import AnnouncementsManagement from '@/features/admin/announcements/AnnouncementsManagementPage';

export default function SuperAdminAnnouncementsPage() {
  return (
    <AnnouncementsManagement
      apiBase="http://localhost:8080/api/superadmin"
      roleLabel="Super Admin"
    />
  );
}
