'use client';

import dynamic from 'next/dynamic';
import Footer from './home/Footer';

const NavbarWrapper = dynamic(() => import('./home/NavbarWrapper'), { ssr: false });

export default function ClientLayout({ children }) {
  return (
    <div className="flex flex-col bg-white">
      <NavbarWrapper />
      <main className="flex-1 min-h-screen bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
}