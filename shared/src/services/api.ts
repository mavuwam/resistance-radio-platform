import axios, { AxiosInstance } from 'axios';

// Security utility - generate secure token
const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token if available
    const csrfToken = sessionStorage.getItem('csrf-token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateSecureToken();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Store CSRF token if provided
    const csrfToken = response.headers['x-csrf-token'];
    if (csrfToken) {
      sessionStorage.setItem('csrf-token', csrfToken);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.clear();
      
      // Redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// Public API methods
export const getShows = async (params?: { category?: string; is_active?: boolean }) => {
  const response = await api.get('/api/shows', { params });
  return response.data.shows || [];
};

export const getShowBySlug = async (slug: string) => {
  const response = await api.get(`/api/shows/${slug}`);
  return response.data;
};

export const getShowEpisodes = async (slug: string, params?: { limit?: number; offset?: number }) => {
  const response = await api.get(`/api/shows/${slug}/episodes`, { params });
  return response.data.episodes || [];
};

export const getEpisodes = async (params?: { 
  category?: string; 
  show_id?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const response = await api.get('/api/episodes', { params });
  return response.data.episodes || [];
};

export const getEpisodeBySlug = async (slug: string) => {
  const response = await api.get(`/api/episodes/${slug}`);
  return response.data;
};

export const getArticles = async (params?: { 
  category?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const response = await api.get('/api/articles', { params });
  return response.data.articles || [];
};

export const getArticleBySlug = async (slug: string) => {
  const response = await api.get(`/api/articles/${slug}`);
  return response.data;
};

export const getEvents = async (params?: { 
  event_type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await api.get('/api/events', { params });
  return response.data.events || [];
};

export const getEventBySlug = async (slug: string) => {
  const response = await api.get(`/api/events/${slug}`);
  return response.data;
};

export const getResources = async (params?: { 
  category?: string;
  resource_type?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await api.get('/api/resources', { params });
  return response.data.resources || [];
};

export const getResourceBySlug = async (slug: string) => {
  const response = await api.get(`/api/resources/${slug}`);
  return response.data;
};

export const getLiveStatus = async () => {
  const response = await api.get('/api/live/status');
  return response.data;
};

// Admin API methods
export const getAdminArticles = async (params?: { 
  search?: string;
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const response = await api.get('/api/admin/articles', { params });
  return response.data;
};

export const getAdminArticle = async (id: number) => {
  const response = await api.get(`/api/admin/articles/${id}`);
  return response.data;
};

export const createArticle = async (data: any) => {
  const response = await api.post('/api/admin/articles', data);
  return response.data;
};

export const updateArticle = async (id: number, data: any) => {
  const response = await api.put(`/api/admin/articles/${id}`, data);
  return response.data;
};

export const deleteArticle = async (id: number) => {
  const response = await api.delete(`/api/admin/articles/${id}`);
  return response.data;
};

export const publishArticle = async (id: number) => {
  const response = await api.post(`/api/admin/articles/${id}/publish`, {});
  return response.data;
};

export const unpublishArticle = async (id: number) => {
  const response = await api.post(`/api/admin/articles/${id}/unpublish`, {});
  return response.data;
};

export const bulkPublishArticles = async (ids: number[]) => {
  const response = await api.post('/api/admin/articles/bulk/publish', { ids });
  return response.data;
};

export const bulkUnpublishArticles = async (ids: number[]) => {
  const response = await api.post('/api/admin/articles/bulk/unpublish', { ids });
  return response.data;
};

export const getAdminEvents = async (params?: { 
  search?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const response = await api.get('/api/admin/events', { params });
  return response.data;
};

export const getAdminEvent = async (id: number) => {
  const response = await api.get(`/api/admin/events/${id}`);
  return response.data;
};

export const createEvent = async (data: any) => {
  const response = await api.post('/api/admin/events', data);
  return response.data;
};

export const updateEvent = async (id: number, data: any) => {
  const response = await api.put(`/api/admin/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: number) => {
  const response = await api.delete(`/api/admin/events/${id}`);
  return response.data;
};

export const getAdminResources = async (params?: { 
  search?: string;
  file_type?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const response = await api.get('/api/admin/resources', { params });
  return response.data;
};

export const getAdminResource = async (id: number) => {
  const response = await api.get(`/api/admin/resources/${id}`);
  return response.data;
};

export const createResource = async (data: any) => {
  const response = await api.post('/api/admin/resources', data);
  return response.data;
};

export const updateResource = async (id: number, data: any) => {
  const response = await api.put(`/api/admin/resources/${id}`, data);
  return response.data;
};

export const deleteResource = async (id: number) => {
  const response = await api.delete(`/api/admin/resources/${id}`);
  return response.data;
};

export const getAdminEpisodes = async (params?: { 
  search?: string;
  show_id?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const response = await api.get('/api/admin/episodes', { params });
  return response.data;
};

export const getAdminEpisode = async (id: number) => {
  const response = await api.get(`/api/admin/episodes/${id}`);
  return response.data;
};

export const createEpisode = async (data: any) => {
  const response = await api.post('/api/admin/episodes', data);
  return response.data;
};

export const updateEpisode = async (id: number, data: any) => {
  const response = await api.put(`/api/admin/episodes/${id}`, data);
  return response.data;
};

export const deleteEpisode = async (id: number) => {
  const response = await api.delete(`/api/admin/episodes/${id}`);
  return response.data;
};

export const getAdminShows = async (params?: { 
  search?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const response = await api.get('/api/admin/shows', { params });
  return response.data;
};

export const getAdminShow = async (id: number) => {
  const response = await api.get(`/api/admin/shows/${id}`);
  return response.data;
};

export const createShow = async (data: any) => {
  const response = await api.post('/api/admin/shows', data);
  return response.data;
};

export const updateShow = async (id: number, data: any) => {
  const response = await api.put(`/api/admin/shows/${id}`, data);
  return response.data;
};

export const deleteShow = async (id: number) => {
  const response = await api.delete(`/api/admin/shows/${id}`);
  return response.data;
};

export const getAdminSubmissions = async (params?: { 
  search?: string;
  status?: string;
  content_type?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}) => {
  const response = await api.get('/api/admin/submissions', { params });
  return response.data;
};

export const getAdminSubmission = async (id: number) => {
  const response = await api.get(`/api/admin/submissions/${id}`);
  return response.data;
};

export const updateSubmissionStatus = async (id: number, status: 'pending' | 'approved' | 'rejected') => {
  const response = await api.put(`/api/admin/submissions/${id}/status`, { status });
  return response.data;
};

export const deleteSubmission = async (id: number) => {
  const response = await api.delete(`/api/admin/submissions/${id}`);
  return response.data;
};

// File Upload
export const uploadFile = async (file: File, type: 'image' | 'audio' | 'document') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

export default api;
