import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiService, clearStoredSession, extractApiError, getStoredSession, setStoredSession, type AuthSession, type AuthUser } from '@/services/api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  role: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredSession();
    setSession(stored);
    setLoading(false);

    const onUnauthorized = () => {
      setSession(null);
      clearStoredSession();
    };

    window.addEventListener('smartmall:unauthorized', onUnauthorized);
    return () => window.removeEventListener('smartmall:unauthorized', onUnauthorized);
  }, []);

  const value = useMemo(() => {
    const user = session?.user ?? null;
    const role = user?.role ?? null;

    const signIn = async (email: string, password: string) => {
      const response = await apiService.post('/login', { email, password });
      const payload = response.data;
      const nextSession: AuthSession = {
        token: payload.data.token,
        user: payload.data.user,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };
      setStoredSession(nextSession);
      setSession(nextSession);
    };

    const signUp = async (fullName: string, email: string, password: string) => {
      const response = await apiService.post('/register', { fullName, email, password });
      const payload = response.data;
      const nextSession: AuthSession = {
        token: payload.data.token,
        user: payload.data.user,
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };
      setStoredSession(nextSession);
      setSession(nextSession);
    };

    const signOut = () => {
      clearStoredSession();
      setSession(null);
    };

    return {
      user,
      token: session?.token ?? null,
      role,
      loading,
      isAuthenticated: Boolean(session?.token),
      signIn,
      signUp,
      signOut,
    };
  }, [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export function useAuthError() {
  return (error: unknown) => extractApiError(error);
}
