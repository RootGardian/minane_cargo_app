const API_BASE = '/api';

export const getAdminToken = () => sessionStorage.getItem('minane_admin_token') || localStorage.getItem('minane_admin_token');
export const setAdminToken = (token) => {
  sessionStorage.setItem('minane_admin_token', token);
  localStorage.removeItem('minane_admin_token');
};
export const removeAdminToken = () => {
  sessionStorage.removeItem('minane_admin_token');
  localStorage.removeItem('minane_admin_token');
  sessionStorage.removeItem('minane_current_view');
};

export const getWholesalerToken = () => localStorage.getItem('minane_wholesaler_token');
export const setWholesalerToken = (token) => localStorage.setItem('minane_wholesaler_token', token);
export const removeWholesalerToken = () => localStorage.removeItem('minane_wholesaler_token');

async function request(endpoint, options = {}, tokenType = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (tokenType === 'admin') {
    const token = getAdminToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } else if (tokenType === 'wholesaler') {
    const token = getWholesalerToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue lors de la communication avec le serveur.');
  }

  return data;
}

export const api = {
  // Public
  getSettings: () => request('/settings'),
  trackShipment: (code) => request(`/tracking/${encodeURIComponent(code)}`),

  // Auth
  loginAdmin: (credentials) => request('/auth/admin/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getAdminMe: () => request('/auth/admin/me', {}, 'admin'),
  loginWholesaler: (credentials) => request('/auth/wholesaler/login', { method: 'POST', body: JSON.stringify(credentials) }),

  // Wholesaler
  getWholesalerDashboard: () => request('/client/dashboard', {}, 'wholesaler'),

  // Admin Shipments
  getShipments: (params = '') => request(`/shipments${params ? `?${params}` : ''}`, {}, 'admin'),
  getShipmentById: (id) => request(`/shipments/${id}`, {}, 'admin'),
  createShipment: (payload) => request('/shipments', { method: 'POST', body: JSON.stringify(payload) }, 'admin'),
  updateShipment: (id, payload) => request(`/shipments/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, 'admin'),
  updateShipmentStatus: (id, payload) => request(`/shipments/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }, 'admin'),
  deliverShipmentSecure: (id, payload) => request(`/shipments/${id}/deliver`, { method: 'POST', body: JSON.stringify(payload) }, 'admin'),

  // Admin Containers
  getContainers: () => request('/containers', {}, 'admin'),
  getContainerById: (id) => request(`/containers/${id}`, {}, 'admin'),
  createContainer: (payload) => request('/containers', { method: 'POST', body: JSON.stringify(payload) }, 'admin'),
  updateContainerStatusBulk: (id, payload) => request(`/containers/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }, 'admin'),
  updateContainer: (id, payload) => request(`/containers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, 'admin'),
  addContainerExpense: (id, payload) => request(`/containers/${id}/expenses`, { method: 'POST', body: JSON.stringify(payload) }, 'admin'),
  deleteContainerExpense: (containerId, expenseId) => request(`/containers/${containerId}/expenses/${expenseId}`, { method: 'DELETE' }, 'admin'),

  // Admin Payments & Receivables
  recordPayment: (payload) => request('/payments', { method: 'POST', body: JSON.stringify(payload) }, 'admin'),
  getReceivables: () => request('/payments/receivables', {}, 'admin'),
  getRecentPayments: () => request('/payments/recent', {}, 'admin'),

  // Admin Clients
  getClients: (params = '') => request(`/clients${params ? `?${params}` : ''}`, {}, 'admin'),
  createClient: (payload) => request('/clients', { method: 'POST', body: JSON.stringify(payload) }, 'admin'),
  updateClient: (id, payload) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, 'admin'),

  // Admin Settings
  updateSettings: (payload) => request('/settings', { method: 'PUT', body: JSON.stringify(payload) }, 'admin'),

  // Admin — Zone Dangereuse
  resetDatabase: (confirmPhrase) => request('/admin/reset-data', { method: 'DELETE', body: JSON.stringify({ confirmPhrase }) }, 'admin')
};

