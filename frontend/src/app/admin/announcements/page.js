import AnnouncementsManagement from '@/features/admin/announcements/AnnouncementsManagementPage';

export default function AdminAnnouncementsPage() {
  return (
    <AnnouncementsManagement
      apiBase="http://localhost:8080/api/admin"
      roleLabel="Admin"
    />
  );
}
