'use client';

import dynamic from 'next/dynamic';

const NavbarWrapper = dynamic(() => import('./home/NavbarWrapper'), { ssr: false });

export default function ClientLayout({ children }) {
  return (
    <>
      <NavbarWrapper />
      {children}
    </>
  );
}