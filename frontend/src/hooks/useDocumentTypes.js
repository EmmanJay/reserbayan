import { useState, useEffect, useRef } from 'react';

const CACHE_KEY = 'reserbayan_document_types';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return { data, timestamp, isStale: Date.now() - timestamp > CACHE_TTL };
  } catch {
    return null;
  }
}

function setCachedData(data) {
  try {
    if (data && Array.isArray(data) && data.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    }
  } catch {
    // localStorage might be full or unavailable
  }
}

export function useDocumentTypes() {
  const [documentsData, setDocumentsData] = useState(() => {
    // Initialize from cache immediately (SSR-safe)
    if (typeof window === 'undefined') return [];
    const cached = getCachedData();
    return cached ? cached.data : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const cached = getCachedData();

    // If we have fresh cached data, use it and skip fetch
    if (cached && !cached.isStale) {
      setDocumentsData(cached.data);
      setLoading(false);
      return;
    }

    // If we have stale cached data, show it immediately but fetch in background
    if (cached && cached.isStale) {
      setDocumentsData(cached.data);
      setLoading(false); // Don't show loading spinner for stale data
    }

    const fetchDocuments = async () => {
      try {
        // Try the Vercel ISR-cached route first (instant on Vercel)
        // Falls back to direct backend call if ISR route fails
        let response;
        try {
          response = await fetch('/api/document-types');
          if (!response.ok || response.status === 503) throw new Error('ISR unavailable');
        } catch {
          // Fallback to direct backend call
          response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/document-types`);
        }

        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }

        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          setDocumentsData(data);
          setCachedData(data);
        }
      } catch (err) {
        // Only set error if we have no cached data at all
        if (!cached) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  return { documentsData, loading, error };
}