import { createContext } from 'react';
import type { UserPublic } from '../types';

export type AuthLoginPayload = {
  token: string;
  user: UserPublic;
};

export type AuthContextValue = {
  token: string | null;
  user: UserPublic | null;
  isAuthenticated: boolean;
  login: (payload: AuthLoginPayload) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
