import AnnouncementsManagement from '@/app/components/admin/AnnouncementsManagementPage';

export default function AdminAnnouncementsPage() {
  return (
    <AnnouncementsManagement
      apiBase="http://localhost:8080/api/admin"
      roleLabel="Admin"
    />
  );
}
