import AddDocumentModalPage from '@/features/admin/documents/AddDocumentModalPage';
import AdminDocumentsPage from '@/features/admin/documents/AdminDocumentsPage';

export default function AdminAddDocumentPage() {
  return (
    <>
      <AdminDocumentsPage />
      <AddDocumentModalPage basePath="/admin" />
    </>
  );
}
