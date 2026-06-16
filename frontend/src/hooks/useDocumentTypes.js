import { useState, useEffect } from 'react';

const CACHE_KEY = 'reserbayan_document_types_cache';
const CACHE_VERSION = 'v1'; // Change this if schema changes

export function useDocumentTypes() {
  const [documentsData, setDocumentsData] = useState(() => {
    // 1. Try to load from localStorage immediately on mount
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.version === CACHE_VERSION && parsed.data && parsed.data.length > 0) {
            return parsed.data;
          }
        }
      } catch (err) {
        console.error('Failed to parse cached document types:', err);
      }
    }
    return [];
  });
  
  // If we have cached data, we can consider loading to be false initially
  const [loading, setLoading] = useState(documentsData.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDocuments = async () => {
      try {
        // We always fetch to get the latest data (SWR pattern)
        const response = await fetch('/api/document-types');
        
        if (!response.ok) {
          // If backend is sleeping (503) and we have cached data, we can ignore the error
          if (documentsData.length > 0) {
            console.warn(`Backend returned ${response.status}. Using cached data.`);
            return;
          }
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        
        // Only update if mounted and data is valid
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDocumentsData(data);
          setError(null);
          
          // Save to cache for next time
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              version: CACHE_VERSION,
              timestamp: Date.now(),
              data: data
            }));
          } catch (err) {
            console.error('Failed to cache document types:', err);
          }
        }
      } catch (err) {
        if (isMounted) {
          if (documentsData.length === 0) {
            setError(err.message);
          } else {
            console.warn('Network error, continuing to use cached data:', err.message);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDocuments();

    return () => {
      isMounted = false;
    };
  }, []); // Note: documentsData is omitted from deps intentionally to avoid infinite loops

  return { documentsData, loading, error };
}