export type Role = 'admin' | 'staff';

export enum Permission {
  VIEW_STAFF_ALL = 'VIEW_STAFF_ALL',
  VIEW_OWN_PROFILE = 'VIEW_OWN_PROFILE',
  MANAGE_COURTS = 'MANAGE_COURTS',
  MANAGE_SHIFTS = 'MANAGE_SHIFTS',
  MANAGE_USERS = 'MANAGE_USERS',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  avatarUrl?: string; // Updated from avatar
  phone?: string;     // Added phone
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}
