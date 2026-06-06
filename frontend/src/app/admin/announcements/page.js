import AnnouncementsManagement from '@/features/admin/announcements/AnnouncementsManagementPage';

export default function AdminAnnouncementsPage() {
  return (
    <AnnouncementsManagement
      apiBase={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin`}
      roleLabel="Admin"
    />
  );
}
