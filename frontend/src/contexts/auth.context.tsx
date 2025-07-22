import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, User, LoginCredentials, SignupCredentials } from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status on mount
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const user = await authService.login(credentials);
      setUser(user);
      
      // Navigate based on onboarding status
      if (user.onboardingCompleted) {
        navigate('/');
      } else {
        navigate('/goals');
      }
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.email}`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      setIsLoading(true);
      const user = await authService.signup(credentials);
      setUser(user);
      
      // New users go to onboarding
      navigate('/goals');
      
      toast({
        title: "Account created!",
        description: "Let's set up your health goals",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      navigate('/auth');
      
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
    } catch (error: any) {
      toast({
        title: "Logout error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};