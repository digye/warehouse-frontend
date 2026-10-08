// Wraps fetch() so every request automatically includes the login token
// and points at the back end.
//
// Locally (npm run dev), VITE_API_BASE is unset, so this falls back to '/api',
// which Vite's dev proxy forwards to localhost:4000 (see vite.config.js).
// In production, VITE_API_BASE is set at build time (on Render, as an
// environment variable on the frontend service) to the real back-end URL,
// e.g. https://warehouse-backend-xxxx.onrender.com/api
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}${path}`, {
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