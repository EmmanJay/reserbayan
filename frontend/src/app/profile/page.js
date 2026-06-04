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
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <div className="rounded-3xl border border-[#d8def2] bg-white p-8 text-center shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d8def2] border-b-[#243b8e]" />
        <h1 className="mt-4 text-xl font-extrabold text-[#122361]">Redirecting profile</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Opening your dashboard...</p>
      </div>
    </div>
  );
}
