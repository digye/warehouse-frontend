// Wraps fetch() so every request automatically includes the login token
// and points at the back end (proxied through /api in vite.config.js).

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    // Token missing or expired - send back to login
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Something went wrong');
  }

  if (res.status === 204) return null;
  return res.json();
}