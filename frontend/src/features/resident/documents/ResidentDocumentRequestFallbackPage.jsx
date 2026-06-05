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
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-[#FAFAFA] px-4">
      <div className="rounded-3xl border border-[#d8def2] bg-white p-8 text-center shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d8def2] border-b-[#243b8e]" />
        <h1 className="mt-4 text-xl font-extrabold text-[#122361]">
          Opening request drawer
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Preparing your document request form...
        </p>
      </div>
    </div>
  );
}
