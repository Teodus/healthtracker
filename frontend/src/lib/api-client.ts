import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private static instance: ApiClient;
  private token: string | null = null;

  private constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      
      console.error('[DEBUG] API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: error
      });
      
      // Handle specific error cases
      if (response.status === 401) {
        // Token expired or invalid
        this.setToken(null);
        window.location.href = '/auth';
        throw new Error('Session expired. Please login again.');
      }

      throw new Error(error.message || `Error: ${response.status}`);
    }

    return response.json();
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    // Check network connectivity (important for mobile apps)
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Add auth token if required
    if (requiresAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
    };

    console.log('[DEBUG] API Request:', {
      url: `${API_URL}${endpoint}`,
      method: fetchOptions.method || 'GET',
      hasToken: !!this.token,
      requiresAuth,
      token: this.token ? this.token.substring(0, 20) + '...' : null
    });

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const result = await this.handleResponse<T>(response);
      console.log('[DEBUG] API Response:', { endpoint, status: response.status, data: result });
      return result;
    } catch (error) {
      console.error('[DEBUG] API Error:', { endpoint, error });
      // Network errors or other issues
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please check if the app is running.');
      }
      throw error;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Special method for file uploads (like voice recordings)
  async uploadFile<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options || {};

    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    }

    const headers: HeadersInit = {
      ...fetchOptions.headers,
      // Don't set Content-Type for FormData - browser will set it with boundary
    };

    if (requiresAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        method: 'POST',
        headers,
        body: formData,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please check if the app is running.');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Export types for responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}