import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Shows
export const getShows = async (params?: { category?: string; is_active?: boolean }) => {
  const response = await api.get('/shows', { params });
  return response.data.shows || [];
};

export const getShowBySlug = async (slug: string) => {
  const response = await api.get(`/shows/${slug}`);
  return response.data;
};

export const getShowEpisodes = async (slug: string, params?: { limit?: number; offset?: number }) => {
  const response = await api.get(`/shows/${slug}/episodes`, { params });
  return response.data.episodes || [];
};

// Episodes
export const getEpisodes = async (params?: { 
  category?: string; 
  show_id?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const response = await api.get('/episodes', { params });
  return response.data.episodes || [];
};

export const getEpisodeBySlug = async (slug: string) => {
  const response = await api.get(`/episodes/${slug}`);
  return response.data;
};

// Articles
export const getArticles = async (params?: { 
  category?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const response = await api.get('/articles', { params });
  return response.data.articles || [];
};

export const getArticleBySlug = async (slug: string) => {
  const response = await api.get(`/articles/${slug}`);
  return response.data;
};

// Events
export const getEvents = async (params?: { 
  event_type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await api.get('/events', { params });
  return response.data.events || [];
};

export const getEventBySlug = async (slug: string) => {
  const response = await api.get(`/events/${slug}`);
  return response.data;
};

// Resources
export const getResources = async (params?: { 
  category?: string;
  resource_type?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await api.get('/resources', { params });
  return response.data.resources || [];
};

export const getResourceBySlug = async (slug: string) => {
  const response = await api.get(`/resources/${slug}`);
  return response.data;
};

// Live Status
export const getLiveStatus = async () => {
  const response = await api.get('/live/status');
  return response.data;
};

// Admin - Articles
export const getAdminArticles = async (params?: { 
  search?: string;
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const token = localStorage.getItem('token');
  const response = await api.get('/admin/articles', { 
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminArticle = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/admin/articles/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createArticle = async (data: any) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/admin/articles', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateArticle = async (id: number, data: any) => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/admin/articles/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteArticle = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.delete(`/admin/articles/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const publishArticle = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.post(`/admin/articles/${id}/publish`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const unpublishArticle = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.post(`/admin/articles/${id}/unpublish`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const bulkPublishArticles = async (ids: number[]) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/admin/articles/bulk/publish', { ids }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const bulkUnpublishArticles = async (ids: number[]) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/admin/articles/bulk/unpublish', { ids }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Admin - Events
export const getAdminEvents = async (params?: { 
  search?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const token = localStorage.getItem('token');
  const response = await api.get('/admin/events', { 
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminEvent = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/admin/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createEvent = async (data: any) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/admin/events', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateEvent = async (id: number, data: any) => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/admin/events/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteEvent = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.delete(`/admin/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Admin - Resources
export const getAdminResources = async (params?: { 
  search?: string;
  file_type?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const token = localStorage.getItem('token');
  const response = await api.get('/admin/resources', { 
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminResource = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/admin/resources/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createResource = async (data: any) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/admin/resources', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateResource = async (id: number, data: any) => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/admin/resources/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteResource = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.delete(`/admin/resources/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Admin - Episodes
export const getAdminEpisodes = async (params?: { 
  search?: string;
  show_id?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const token = localStorage.getItem('token');
  const response = await api.get('/admin/episodes', { 
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminEpisode = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/admin/episodes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createEpisode = async (data: any) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/admin/episodes', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateEpisode = async (id: number, data: any) => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/admin/episodes/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteEpisode = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.delete(`/admin/episodes/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Admin - Shows (enhanced)
export const getAdminShows = async (params?: { 
  search?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const token = localStorage.getItem('token');
  const response = await api.get('/admin/shows', { 
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminShow = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/admin/shows/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createShow = async (data: any) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/admin/shows', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateShow = async (id: number, data: any) => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/admin/shows/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteShow = async (id: number) => {
  const token = localStorage.getItem('token');
  const response = await api.delete(`/admin/shows/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// File Upload
export const uploadFile = async (file: File, type: 'image' | 'audio' | 'document') => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export default api;
