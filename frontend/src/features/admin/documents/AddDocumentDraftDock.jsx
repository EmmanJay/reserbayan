'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AddDocumentModalPage from '@/features/admin/documents/AddDocumentModalPage';

const draftStorageKey = 'reserbayan:add-document-draft';
const openAddDocumentEvent = 'reserbayan:open-add-document-modal';

function readStoredDraft() {
  if (typeof window === 'undefined') return null;

  try {
    const storedDraft = sessionStorage.getItem(draftStorageKey);
    return storedDraft ? JSON.parse(storedDraft) : null;
  } catch {
    return null;
  }
}

function getBasePathFromPathname(pathname) {
  return pathname?.startsWith('/superadmin') ? '/superadmin' : '/admin';
}

export default function AddDocumentDraftDock() {
  const pathname = usePathname();
  const lastAdminBasePathRef = useRef('/admin');
  const [draft, setDraft] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBasePath, setModalBasePath] = useState('/admin');
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/superadmin');
  const isDirectAddRoute = pathname?.endsWith('/documents/add');

  useEffect(() => {
    if (isAdminRoute) {
      lastAdminBasePathRef.current = getBasePathFromPathname(pathname);
    }
  }, [isAdminRoute, pathname]);

  useEffect(() => {
    const syncDraft = () => {
      const storedDraft = readStoredDraft();
      setDraft(storedDraft);

      if (storedDraft?.minimized && isAdminRoute && !isDirectAddRoute) {
        setModalBasePath(storedDraft.basePath || lastAdminBasePathRef.current);
        setModalOpen(true);
      }
    };

    const handleOpenAddDocument = (event) => {
      const nextBasePath = event.detail?.basePath || lastAdminBasePathRef.current;

      setModalBasePath(nextBasePath);
      setModalOpen(true);
    };

    const handleClickFallbackLinks = (event) => {
      if (!isAdminRoute) return;

      const anchor = event.target.closest?.('a[href]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      const targetUrl = new URL(href, window.location.href);
      const isAddDocumentLink = targetUrl.pathname === '/admin/documents/add' || targetUrl.pathname === '/superadmin/documents/add';
      if (!isAddDocumentLink) return;

      event.preventDefault();
      event.stopPropagation();
      setModalBasePath(targetUrl.pathname.startsWith('/superadmin') ? '/superadmin' : '/admin');
      setModalOpen(true);
    };

    syncDraft();
    window.addEventListener('storage', syncDraft);
    window.addEventListener('reserbayan:add-document-draft-changed', syncDraft);
    window.addEventListener(openAddDocumentEvent, handleOpenAddDocument);
    document.addEventListener('click', handleClickFallbackLinks, true);

    return () => {
      window.removeEventListener('storage', syncDraft);
      window.removeEventListener('reserbayan:add-document-draft-changed', syncDraft);
      window.removeEventListener(openAddDocumentEvent, handleOpenAddDocument);
      document.removeEventListener('click', handleClickFallbackLinks, true);
    };
  }, [isAdminRoute, isDirectAddRoute]);

  if (!isAdminRoute || isDirectAddRoute || !modalOpen) return null;

  return (
    <AddDocumentModalPage
      basePath={modalBasePath}
      hosted
      initialMinimized={draft?.minimized}
      onClose={() => setModalOpen(false)}
      onMinimizeChange={() => setModalOpen(true)}
    />
  );
}
