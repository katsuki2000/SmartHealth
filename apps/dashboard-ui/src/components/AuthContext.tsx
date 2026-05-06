import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  email: string;
  sub: string;
  role: string;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT payload safely
function decodeJWT(token: string): AuthUser | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('smarthealth_token');
    if (storedToken) {
      const decodedUser = decodeJWT(storedToken);
      if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setUser(decodedUser);
      } else {
        // Token is expired or invalid
        localStorage.removeItem('smarthealth_token');
      }
    }
    setLoading(false);
  }, []);

  // Periodic expiration check
  useEffect(() => {
    if (!token || !user) return;

    const timeUntilExpiry = user.exp * 1000 - Date.now();
    if (timeUntilExpiry <= 0) {
      logout();
      return;
    }

    const timeout = setTimeout(() => {
      logout();
      alert('Votre session a expiré. Veuillez vous reconnecter.');
    }, timeUntilExpiry);

    return () => clearTimeout(timeout);
  }, [token, user]);

  const login = (newToken: string) => {
    const decodedUser = decodeJWT(newToken);
    if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
      localStorage.setItem('smarthealth_token', newToken);
      setToken(newToken);
      setUser(decodedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('smarthealth_token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', background: '#0f172a' }}>Chargement...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
