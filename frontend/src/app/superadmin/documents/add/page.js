import AddDocumentModalPage from '@/app/components/admin/AddDocumentModalPage';
import AdminDocumentsPage from '@/app/admin/documents/page';

export default function SuperAdminAddDocumentPage() {
  return (
    <>
      <AdminDocumentsPage />
      <AddDocumentModalPage basePath="/superadmin" />
    </>
  );
}
