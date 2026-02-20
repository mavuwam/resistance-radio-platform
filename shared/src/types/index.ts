// Shared TypeScript type definitions

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Show {
  id: number;
  title: string;
  description: string;
  host: string;
  schedule: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: number;
  show_id: number;
  title: string;
  description: string;
  audio_url: string;
  duration?: number;
  published_date: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  image_url?: string;
  published_date: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  file_url: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  name: string;
  email: string;
  content_type: 'story' | 'tip' | 'feedback';
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
