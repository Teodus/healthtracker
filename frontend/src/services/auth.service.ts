import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Check if user is already logged in on app start
    this.checkAuthStatus();
  }

  private async checkAuthStatus() {
    const token = apiClient.getToken();
    if (token) {
      try {
        // Verify token is still valid by fetching user profile
        const response = await apiClient.get<{ user: User }>('/user/profile');
        this.currentUser = response.user;
      } catch (error) {
        // Token is invalid, clear it
        this.logout();
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials,
        { requiresAuth: false }
      );

      // Store token and user data
      apiClient.setToken(response.token);
      this.currentUser = response.user;

      // Store user data for offline access
      localStorage.setItem('current_user', JSON.stringify(response.user));

      return response.user;
    } catch (error) {
      throw error;
    }
  }

  async signup(credentials: SignupCredentials): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        credentials,
        { requiresAuth: false }
      );

      // Store token and user data
      apiClient.setToken(response.token);
      this.currentUser = response.user;

      // Store user data for offline access
      localStorage.setItem('current_user', JSON.stringify(response.user));

      return response.user;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Try to logout on server (but don't fail if offline)
      await apiClient.post('/auth/logout').catch(() => {});
    } finally {
      // Always clear local data
      apiClient.setToken(null);
      this.currentUser = null;
      localStorage.removeItem('current_user');
    }
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      // Try to load from localStorage if not in memory
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!apiClient.getToken() && !!this.getCurrentUser();
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<{ user: User }>('/user/profile', data);
    this.currentUser = response.user;
    localStorage.setItem('current_user', JSON.stringify(response.user));
    return response.user;
  }
}

// Export singleton instance
export const authService = new AuthService();