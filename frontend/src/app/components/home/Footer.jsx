import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function Footer() {
  return (
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
              <li><Link href="/homepage" className="hover:text-white">Documents</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Most Requested */}
          <div className="space-y-4 -ml-8">
            <h3 className="font-semibold">Most Requested</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/homepage/barangay-clearance" className="hover:text-white">Barangay Clearance</Link></li>
              <li><Link href="/homepage/certificate-indigency" className="hover:text-white">Certificate of Indigency</Link></li>
              <li><Link href="/homepage/certificate-residency" className="hover:text-white">Certificate of Residency</Link></li>
              <li><Link href="/homepage/barangay-business-permit" className="hover:text-white">Barangay Business Permit / Clearance</Link></li>
              <li><Link href="/homepage/certificate-good-moral" className="hover:text-white">Certificate of Good Moral Character</Link></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2025 ReserBayan. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}