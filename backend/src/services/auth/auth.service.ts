import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/config/supabase';
import { hashPassword, comparePassword } from '@/utils/helpers/password';
import { generateToken } from '@/utils/jwt';
import { ConflictError, AuthenticationError } from '@/utils/errors/app-errors';
import { RegisterDto, LoginDto } from '@/validators/auth.validators';
import { AuthUser } from '@/types/models';
import logger from '@/utils/logger';

export class AuthService {
  async register(data: RegisterDto): Promise<{ user: AuthUser; token: string }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Create user
      const userId = uuidv4();
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: data.email,
          password_hash: passwordHash,
          name: data.name || null,
          preferences: {
            darkMode: false,
            notifications: true,
          },
        })
        .select('id, email, name, preferences, created_at')
        .single();

      if (error) {
        logger.error('Failed to create user:', error);
        throw new Error('Failed to create user');
      }

      // Generate JWT token
      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
      });

      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        preferences: newUser.preferences,
      };

      return { user: authUser, token };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      logger.error('Register error:', error);
      throw new Error('Registration failed');
    }
  }

  async login(data: LoginDto): Promise<{ user: AuthUser; token: string }> {
    try {
      // Find user by email
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, name, password_hash, preferences')
        .eq('email', data.email)
        .single();

      if (error || !user) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await comparePassword(data.password, user.password_hash);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
      };

      return { user: authUser, token };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error('Login error:', error);
      throw new Error('Login failed');
    }
  }

  async logout(userId: string): Promise<void> {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token. However, we can log the event.
    logger.info(`User ${userId} logged out`);
  }
}