const API_BASE = '/api';

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem('token', data.token);
        return null; // Caller should retry
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  async get(path: string) {
    const res = await fetch(`${API_BASE}${path}`, { headers: await getAuthHeaders() });
    return handleResponse(res);
  },

  async post(path: string, body: unknown) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async put(path: string, body: unknown) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  async delete(path: string) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  api.post('/auth/logout', {}).catch(() => {});
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/';
}
