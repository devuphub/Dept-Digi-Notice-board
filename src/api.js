const TOKEN_KEY = 'abesec_notice_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => request('/api/auth/me'),

  getDepartments: () => request('/api/departments'),

  createDepartment: (payload) =>
    request('/api/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getNotices: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        qs.set(key, String(val));
      }
    });
    return request(`/api/notices?${qs.toString()}`);
  },

  recordView: (id) =>
    request(`/api/notices/${id}/view`, { method: 'POST' }),

  createNotice: (formData) =>
    request('/api/notices', {
      method: 'POST',
      body: formData,
    }),

  updateNotice: (id, formData) =>
    request(`/api/notices/${id}`, {
      method: 'PUT',
      body: formData,
    }),

  togglePin: (id) =>
    request(`/api/notices/${id}/pin`, { method: 'PATCH' }),

  deleteNotice: (id) =>
    request(`/api/notices/${id}`, { method: 'DELETE' }),

  toggleAcknowledge: (id) =>
    request(`/api/notices/${id}/acknowledge`, { method: 'POST' }),

  toggleBookmark: (id) =>
    request(`/api/notices/${id}/bookmark`, { method: 'POST' }),
};
