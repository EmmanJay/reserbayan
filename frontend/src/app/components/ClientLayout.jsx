'use client';

import dynamic from 'next/dynamic';
import Footer from './home/Footer';
import { usePathname } from 'next/navigation';
import AddDocumentDraftDock from '@/features/admin/documents/AddDocumentDraftDock';

const NavbarWrapper = dynamic(() => import('./home/NavbarWrapper'), { ssr: false });

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Check if current route is admin/superadmin related
  const isAdminRoute = pathname?.startsWith('/superadmin') || pathname?.startsWith('/admin');
  
  return (
    <div className="flex flex-col bg-white">
      <NavbarWrapper />
      <main className="flex-1 min-h-screen bg-white">
        {children}
      </main>
      {isAdminRoute && <AddDocumentDraftDock />}
      {!isAdminRoute && <Footer />}
    </div>
  );
}
