'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

const mostRequestedLinks = [
  { label: 'Barangay Clearance', href: '/documents/barangay-clearance' },
  { label: 'Certificate of Indigency', href: '/documents/certificate-of-indigency' },
  { label: 'Certificate of Residency', href: '/documents/certificate-of-residency' },
  { label: 'Barangay Business Permit / Clearance', href: '/documents/barangay-business-permit' },
  { label: 'Certificate of Good Moral Character', href: '/documents/certificate-of-good-conduct' },
];

const policyContent = {
  privacy: {
    title: 'Privacy Policy',
    body: [
      'ReserBayan collects only the information needed to process resident accounts, document requests, status updates, and official barangay communication.',
      'Submitted personal information and uploaded files are used for verification and request processing. Access is limited to authorized personnel.',
      'Residents may contact the barangay office to request corrections or updates to their account information.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      'By using ReserBayan, residents agree to provide accurate information and submit only valid documents for barangay request processing.',
      'Processing times may vary depending on verification requirements, office schedules, and document availability.',
      'Misuse of the system, false submissions, or unauthorized access may result in account restrictions or request rejection.',
    ],
  },
};

function PolicyModal({ content, onClose }) {
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-extrabold text-[#00114e]">{content.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#122361]"
            aria-label={`Close ${content.title}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 px-5 py-4 text-sm leading-6">
          {content.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="flex justify-end border-t border-slate-200 bg-[#fafafa] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#243b8e] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#122361]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState(null);
  const activePolicyContent = activePolicy ? policyContent[activePolicy] : null;

  return (
    <>
      <footer className="bg-[#0B1D4E] text-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {/* Brand Section */}
            <div className="space-y-4 mr-16">
              <div className="flex items-center space-x-2">
                <Image
                  src="/reserbayan-logo.png"
                  alt="ReserBayan Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="text-lg font-semibold">ReserBayan</span>
              </div>
              <p className="text-gray-300 text-sm">
                Serving the Filipino community with efficient, secure, and accessible document services.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/documents" className="hover:text-white">Documents</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/faq" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            {/* Most Requested */}
            <div className="space-y-4 -ml-8">
              <h3 className="font-semibold">Most Requested</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {mostRequestedLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-white">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2026 ReserBayan. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button type="button" onClick={() => setActivePolicy('privacy')} className="hover:text-white">
                Privacy Policy
              </button>
              <button type="button" onClick={() => setActivePolicy('terms')} className="hover:text-white">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

      <PolicyModal content={activePolicyContent} onClose={() => setActivePolicy(null)} />
    </>
  );
}
