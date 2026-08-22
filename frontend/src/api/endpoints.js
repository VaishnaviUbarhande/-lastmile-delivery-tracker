import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
};

export const zoneApi = {
  list: () => client.get('/zones'),
  create: (data) => client.post('/zones', data),
  update: (id, data) => client.put(`/zones/${id}`, data),
  remove: (id) => client.delete(`/zones/${id}`),
};

export const rateCardApi = {
  list: () => client.get('/rate-cards'),
  upsert: (data) => client.post('/rate-cards', data),
};

export const userApi = {
  list: (role) => client.get('/users', { params: role ? { role } : {} }),
  create: (data) => client.post('/users', data),
  updateAgentProfile: (id, data) => client.put(`/users/${id}/agent-profile`, data),
  setActive: (id, isActive) => client.put(`/users/${id}/active`, { isActive }),
};

export const orderApi = {
  preview: (data) => client.post('/orders/preview', data),
  create: (data) => client.post('/orders', data),
  list: (params) => client.get('/orders', { params }),
  getById: (id) => client.get(`/orders/${id}`),
  assign: (id, agentId) => client.put(`/orders/${id}/assign`, { agentId }),
  autoAssign: (id) => client.put(`/orders/${id}/auto-assign`),
  updateStatus: (id, status, reason) => client.put(`/orders/${id}/status`, { status, reason }),
  reschedule: (id, rescheduledDate) => client.put(`/orders/${id}/reschedule`, { rescheduledDate }),
  override: (id, status, note) => client.put(`/orders/${id}/override`, { status, note }),
};
