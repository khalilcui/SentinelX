import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api, type AuthResponse, type User } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): User | null {
  const raw = localStorage.getItem('sentinelx_user');
  return raw ? (JSON.parse(raw) as User) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser());
  const [loading, setLoading] = useState(false);

  const persist = (data: AuthResponse) => {
    localStorage.setItem('sentinelx_token', data.access_token);
    localStorage.setItem('sentinelx_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      persist(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        full_name: fullName,
        email,
        password,
      });
      persist(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sentinelx_token');
    localStorage.removeItem('sentinelx_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
