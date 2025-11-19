import { useState, useEffect, useCallback } from 'react';

export function useRequests(user) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user?.residentId) return;

    try {
      console.log('Fetching requests for residentId:', user.residentId);
      const response = await fetch(`http://localhost:8080/api/document-requests/resident/${user.residentId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched requests:', data);
        setRequests(data);
      } else {
        console.error('Failed to fetch requests:', response.status, response.statusText);
        alert('Failed to load requests. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [user?.residentId]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [user, fetchRequests]);

  return { requests, loading, refetchRequests: fetchRequests };
}