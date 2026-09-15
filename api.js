const API_BASE = '/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('nexora_token') || localStorage.getItem('nexora_admin_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const getAdminHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('nexora_admin_token') || localStorage.getItem('nexora_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const api = {
  // Auth
  register: (payload) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  login: (payload) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  // Documents
  uploadDocument: (formData) =>
    fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    }).then(handleResponse),

  getDocuments: () =>
    fetch(`${API_BASE}/documents`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  getDocument: (id) =>
    fetch(`${API_BASE}/documents/${id}`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  deleteDocument: (id) =>
    fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // Analysis
  getAnalysis: (documentId) =>
    fetch(`${API_BASE}/analysis/${documentId}`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  explainSimply: (documentId, payload) =>
    fetch(`${API_BASE}/analysis/${documentId}/explain`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  compareDocuments: (documentIds) =>
    fetch(`${API_BASE}/analysis/compare`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ documentIds })
    }).then(handleResponse),

  // Chat
  getOrCreateChat: (documentId, documentIds) =>
    fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ documentId, documentIds })
    }).then(handleResponse),

  getChats: () =>
    fetch(`${API_BASE}/chat`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  getChat: (id) =>
    fetch(`${API_BASE}/chat/${id}`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  sendMessage: (chatId, message) =>
    fetch(`${API_BASE}/chat/${chatId}/message`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    }).then(handleResponse),

  deleteChat: (id) =>
    fetch(`${API_BASE}/chat/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }).then(handleResponse),

  // Mind Maps
  getMindMap: (documentId, type = 'mindmap', regenerate = false) =>
    fetch(`${API_BASE}/mindmaps/${documentId}?type=${type}&regenerate=${regenerate}`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  updateMindMap: (id, payload) =>
    fetch(`${API_BASE}/mindmaps/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  getMindMaps: () =>
    fetch(`${API_BASE}/mindmaps`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  // Study Mode
  getStudyKit: (documentId, regenerate = false) =>
    fetch(`${API_BASE}/study/${documentId}?regenerate=${regenerate}`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  getStudyMaterials: () =>
    fetch(`${API_BASE}/study`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  // Exports
  generateExport: (payload) =>
    fetch(`${API_BASE}/exports/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  getExports: () =>
    fetch(`${API_BASE}/exports`, {
      method: 'GET',
      headers: getHeaders()
    }).then(handleResponse),

  // Admin
  adminLogin: (payload) =>
    fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  getAdminAnalytics: () =>
    fetch(`${API_BASE}/admin/analytics`, {
      method: 'GET',
      headers: getAdminHeaders()
    }).then(handleResponse),

  getAdminUsers: (params = '') =>
    fetch(`${API_BASE}/admin/users${params}`, {
      method: 'GET',
      headers: getAdminHeaders()
    }).then(handleResponse),

  updateAdminUserStatus: (id, payload) =>
    fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  deleteAdminUser: (id) =>
    fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    }).then(handleResponse),

  getAdminDocuments: () =>
    fetch(`${API_BASE}/admin/documents`, {
      method: 'GET',
      headers: getAdminHeaders()
    }).then(handleResponse),

  deleteAdminDocument: (id) =>
    fetch(`${API_BASE}/admin/documents/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    }).then(handleResponse),

  getActivityLogs: () =>
    fetch(`${API_BASE}/admin/activity-logs`, {
      method: 'GET',
      headers: getAdminHeaders()
    }).then(handleResponse),

  createAdminAccount: (payload) =>
    fetch(`${API_BASE}/admin/create-admin`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  getSystemSettings: () =>
    fetch(`${API_BASE}/admin/settings`, {
      method: 'GET',
      headers: getAdminHeaders()
    }).then(handleResponse),

  updateSystemSettings: (payload) =>
    fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse)
};
