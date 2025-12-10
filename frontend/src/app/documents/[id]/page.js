'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { use, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useUser } from '@/contexts/UserContext';
import PendingRestrictionModal from '@/components/PendingRestrictionModal';

export default function DocumentDetailPage({ params }) {
  const { documentsData, loading, error } = useDocumentTypes();
  const { user } = useUser();
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const [showPendingModal, setShowPendingModal] = useState(false);

  const doc = documentsData.find((doc) => doc.id === resolvedParams.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    notFound(); // Will show a 404 page if no doc is found or error
  }

  return (
    <motion.div
      layoutId={`card-container-${doc.id}`}
      className={`flex flex-col lg:flex-row gap-8 lg:gap-12 ${
        from === 'grid'
          ? 'animate-in fade-in slide-in-from-bottom-5 duration-500'
          : ''
      }`}
    >
      {/* Left part: Image preview */}
      <div className="w-full lg:w-2/5 flex-shrink-0">
        <div className="bg-white border rounded-lg shadow-lg">
          <Image
            src={doc.imagePath.startsWith('/uploads/') ? `http://localhost:8080${doc.imagePath}` : doc.imagePath}
            alt={`${doc.name} preview`}
            width={510}
            height={660}
            className="w-full h-auto rounded-lg"
            priority
          />
        </div>
      </div>

      {/* Right part: Details */}
      <div className="w-full lg:w-3/5">
        {/* Category Badge */}
        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-medium text-sm">
          {doc.details.category}
        </span>

        {/* Title */}
        <h1 className="font-montserrat font-extrabold text-4xl text-blue-900 mt-3">
          {doc.name.toUpperCase()}
        </h1>

        {/* Processing Time */}
        <p className="text-base text-gray-600 mt-2 mb-4">
          <strong>Processing Time:</strong> {doc.details.processingTime}
        </p>

        {/* Long Description */}
        <p className="text-gray-700 text-base leading-relaxed">
          {doc.details.longDescription}
        </p>

        {/* ----------------------------- */}
        {/* REQUIREMENTS SECTION */}
        {/* ----------------------------- */}
        <h3 className="font-montserrat font-bold text-xl text-blue-900 mt-6 mb-3">
          Requirements
        </h3>

        {doc.details.requirements && doc.details.requirements.length > 0 ? (
          <ul className="list-disc list-inside space-y-1.5 text-gray-700">
            {doc.details.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No listed requirements for this document.</p>
        )}

        {/* Uses Section */}
        <h3 className="font-montserrat font-bold text-xl text-blue-900 mt-6 mb-3">
          Uses
        </h3>
        <ul className="list-disc list-inside space-y-1.5 text-gray-700">
          {doc.details.uses.map((use, index) => (
            <li key={index}>{use}</li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => {
              if (user && user.status === 'PENDING') {
                setShowPendingModal(true);
              } else {
                window.location.href = `/documents/${doc.id}/request`;
              }
            }}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-base"
          >
            Request Document
          </button>


          
        </div>
      </div>

      {/* Pending Restriction Modal */}
      <PendingRestrictionModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
      />
    </motion.div>
  );
}
