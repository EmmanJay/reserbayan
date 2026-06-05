export function getAuthHeaders(extraHeaders = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
}

export async function getResponseErrorMessage(response, fallbackMessage) {
  const responseText = await response.text().catch(() => '');

  if (responseText) {
    try {
      const parsedBody = JSON.parse(responseText);
      return parsedBody.error || parsedBody.message || responseText;
    } catch {
      return responseText;
    }
  }

  return `${fallbackMessage} (${response.status})`;
}

export function getStoredJson(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;

  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}
