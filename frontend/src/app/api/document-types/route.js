const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/document-types`, {
      next: { revalidate: 300 }, // Cache for 5 minutes, then revalidate in background
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    // If backend is down (cold start), return empty array with short cache
    // so the client can retry soon
    return Response.json([], {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache',
        'Retry-After': '10',
      },
    });
  }
}
