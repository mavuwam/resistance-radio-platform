import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'content_manager' | 'administrator';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  getTokenExpiry: () => number | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login attempt - API_URL:', API_URL);
    console.log('Login URL:', `${API_URL}/auth/login`);
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });

    const { token: newToken, user: newUser } = response.data;

    setToken(newToken);
    setUser(newUser);

    // Store in localStorage
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));

    // Set default axios header
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const register = async (email: string, password: string, name: string) => {
    await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name
    });

    // After registration, automatically log in
    await login(email, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    // Remove from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // Remove axios header
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshToken = async () => {
    // TODO: Implement backend /api/auth/refresh endpoint
    // For now, this is a placeholder that would call the backend
    // to get a new token with extended expiry
    
    try {
      // When backend endpoint is available:
      // const response = await axios.post(`${API_URL}/auth/refresh`);
      // const { token: newToken, user: newUser } = response.data;
      // setToken(newToken);
      // setUser(newUser);
      // localStorage.setItem('auth_token', newToken);
      // localStorage.setItem('auth_user', JSON.stringify(newUser));
      // axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      console.log('Token refresh requested - backend endpoint not yet implemented');
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  };

  const getTokenExpiry = (): number | null => {
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      
      // Return expiry time in milliseconds
      return decoded.exp ? decoded.exp * 1000 : null;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    refreshToken,
    getTokenExpiry,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'administrator' || user?.role === 'content_manager',
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
