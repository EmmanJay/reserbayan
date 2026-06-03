'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useRequestDrawer } from '@/contexts/RequestDrawerContext';

export default function RequestDocumentFallbackPage() {
  const { id } = useParams();
  const router = useRouter();
  const { documentsData, loading, error } = useDocumentTypes();
  const { startRequest } = useRequestDrawer();

  useEffect(() => {
    if (loading) return;

    const document = documentsData.find((item) => item.id === id);

    if (document) {
      startRequest(document);
      router.replace(`/documents/${id}`);
      return;
    }

    if (error || !document) {
      router.replace('/documents');
    }
  }, [documentsData, error, id, loading, router, startRequest]);

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-b-blue-600" />
        <h1 className="mt-4 font-montserrat text-xl font-extrabold text-[#0F2A6B]">
          Opening request drawer
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Preparing your document request form...
        </p>
      </div>
    </div>
  );
}
