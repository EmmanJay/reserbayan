'use client';

import { useEffect } from 'react';

/**
 * Invisible component that pings the backend health endpoint on mount.
 * This wakes up the Render/Railway server early so that by the time
 * users navigate to a page that needs real data, the server is warm.
 */
export default function BackendWarmup() {
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Fire-and-forget ping to wake the backend
    fetch(`${apiUrl}/api/health`, { method: 'GET', mode: 'cors' }).catch(() => {
      // Silently ignore — this is just a warmup, not critical
    });
  }, []);

  return null; // Renders nothing
}
