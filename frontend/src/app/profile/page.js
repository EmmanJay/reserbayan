'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function getProfileRedirect(role) {
  if (role === 'SUPER_ADMIN') return '/superadmin/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/dashboard';
}

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');

    if (!user) {
      router.replace('/');
      return;
    }

    router.replace(getProfileRedirect(role));
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FBFF] px-4">
      <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-b-blue-600" />
        <h1 className="mt-4 font-montserrat text-xl font-extrabold text-[#1E2566]">Redirecting profile</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Opening your dashboard...</p>
      </div>
    </div>
  );
}
