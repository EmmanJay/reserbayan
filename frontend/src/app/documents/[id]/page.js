'use client';

import Image from 'next/image';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { use, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Info,
  ListChecks,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useUser } from '@/contexts/UserContext';
import { useRequestDrawer } from '@/contexts/RequestDrawerContext';
import PendingRestrictionModal from '@/app/components/PendingRestrictionModal';
import RejectedResubmitModal from '@/app/components/RejectedResubmitModal';

export default function DocumentDetailPage({ params }) {
  const { documentsData, loading, error } = useDocumentTypes();
  const { user } = useUser();
  const { startRequest } = useRequestDrawer();
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get('from');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const doc = documentsData.find((documentItem) => documentItem.id === resolvedParams.id);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-b-blue-600" />
          <p className="mt-4 font-medium text-slate-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    notFound();
  }

  const requirements = doc.details?.requirements || [];
  const uses = doc.details?.uses || [];
  const imageSource = doc.imagePath.startsWith('/uploads/')
    ? `http://localhost:8080${doc.imagePath}`
    : doc.imagePath;

  const handleRequestDocument = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('showSignUp'));
      return;
    }

    if (user.status === 'PENDING') {
      setShowPendingModal(true);
    } else if (user.status === 'REJECTED') {
      setShowRejectedModal(true);
    } else {
      startRequest(doc);
    }
  };

  return (
    <>
      <motion.div
        layoutId={`card-container-${doc.id}`}
        className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,390px)] xl:grid-cols-[minmax(0,1fr)_420px]"
        initial={{ opacity: 0, y: from === 'grid' ? 28 : 14, scale: from === 'grid' ? 0.985 : 1 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.42, ease: 'easeOut' }}
      >
        <section className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur lg:p-6">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[5rem] bg-gradient-to-br from-blue-50 to-sky-100" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                <BadgeCheck className="h-3.5 w-3.5" />
                {doc.details?.category || 'General'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                <Clock3 className="h-3.5 w-3.5 text-blue-600" />
                {doc.details?.processingTime || 'Timeline to be confirmed'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                {requirements.length} requirements
              </span>
            </div>

            <h1 className="mt-4 font-montserrat text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#0F2A6B] lg:text-4xl">
              {doc.name}
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              {doc.details?.longDescription || doc.shortDescription}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <Clock3 className="h-5 w-5 text-blue-700" />
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-blue-500">Processing</p>
                <p className="mt-1 text-sm font-extrabold text-slate-800">{doc.details?.processingTime || 'TBD'}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRequirements(true)}
                className="rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <ListChecks className="h-5 w-5 text-blue-700" />
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-blue-500">Requirements</p>
                <p className="mt-1 text-sm font-extrabold text-slate-800">View checklist</p>
              </button>
              <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-blue-700" />
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-blue-500">Status</p>
                <p className="mt-1 text-sm font-extrabold text-slate-800">Ready to request</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-700" />
                <h2 className="font-montserrat text-lg font-extrabold text-[#0F2A6B]">Common Uses</h2>
              </div>
              {uses.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {uses.slice(0, 6).map((useItem, index) => (
                    <span
                      key={`${useItem}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {useItem}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No listed uses for this document yet.</p>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleRequestDocument}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(37,99,235,0.32)]"
              >
                Request Document
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowRequirements(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 transition-all hover:border-blue-300 hover:text-blue-700"
              >
                View Requirements
              </button>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
            <div className="mb-3 flex items-center justify-between px-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Document Preview</p>
                <p className="text-sm font-bold text-slate-700">Official sample</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                Preview
              </span>
            </div>
            <div className="flex max-h-[calc(100vh-11rem)] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 p-3">
              <Image
                src={imageSource}
                alt={`${doc.name} preview`}
                width={510}
                height={660}
                className="max-h-[calc(100vh-13rem)] w-auto rounded-xl object-contain shadow-sm"
                priority
              />
            </div>
          </div>
        </aside>
      </motion.div>

      <AnimatePresence>
        {showRequirements && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.25)]"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-sky-50 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Checklist</p>
                  <h2 className="mt-1 font-montserrat text-2xl font-extrabold text-[#0F2A6B]">Requirements</h2>
                  <p className="mt-1 text-sm text-slate-600">{doc.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRequirements(false)}
                  className="rounded-full bg-white p-2 text-slate-500 shadow-sm transition-all hover:text-blue-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5">
                {requirements.length > 0 ? (
                  <ul className="space-y-3">
                    {requirements.map((requirement, index) => (
                      <li
                        key={`${requirement}-${index}`}
                        className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold leading-6 text-slate-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    No listed requirements for this document.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PendingRestrictionModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
      />

      <RejectedResubmitModal
        isOpen={showRejectedModal}
        onClose={() => setShowRejectedModal(false)}
        onResubmit={() => {
          setShowRejectedModal(false);
          router.push('/dashboard?openActivity=true');
        }}
      />
    </>
  );
}
