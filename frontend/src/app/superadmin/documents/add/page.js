import AddDocumentModalPage from '@/features/admin/documents/AddDocumentModalPage';
import AdminDocumentsPage from '@/features/admin/documents/AdminDocumentsPage';

export default function SuperAdminAddDocumentPage() {
  return (
    <>
      <AdminDocumentsPage />
      <AddDocumentModalPage basePath="/superadmin" />
    </>
  );
}
