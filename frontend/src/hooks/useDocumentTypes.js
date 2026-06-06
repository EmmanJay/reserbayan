import { useState, useEffect } from 'react';

export function useDocumentTypes() {
  const [documentsData, setDocumentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/document-types`);
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocumentsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  return { documentsData, loading, error };
}