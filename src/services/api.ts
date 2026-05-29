import axios from 'axios';

type ApiErrorPayload = {
  message?: string;
  errors?: unknown;
};

const storageKey = 'smartmall.session';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  type: 'admin' | 'employee';
};

export type AuthSession = {
  token: string;
  user: AuthUser;
  expiresAt: number;
};

const isLocalDev = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
const apiBaseUrl = import.meta.env.VITE_API_URL || (isLocalDev ? 'http://localhost:4000/api' : '/api');

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
});

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AuthSession;

    if (!parsed?.token || !parsed?.user) return null;
    if (Date.now() >= parsed.expiresAt) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function setStoredSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey);
}

api.interceptors.request.use((config) => {
  const session = getStoredSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      clearStoredSession();
      window.dispatchEvent(new Event('smartmall:unauthorized'));
    }

    const message = error?.response?.data?.message || error?.message || 'Unexpected error';
    const apiError = new Error(message);
    (apiError as Error & { response?: unknown }).response = error?.response;
    throw apiError;
  },
);

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    return payload?.message || error.message || 'Request failed';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Request failed';
}

export const apiService = api;

export default apiService;
