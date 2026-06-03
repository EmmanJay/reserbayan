'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?notifications=open');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center text-sm font-semibold text-slate-500">
      Opening notifications...
    </div>
  );
}
