import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('token');
    const isExpired = storedToken && isTokenExpired(storedToken);
    return isExpired ? null : storedToken;
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!token);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (token && isTokenExpired(token)) {
        setToken(null); // This will also trigger setIsLoggedIn(false) via the effect above
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const value = { token, setToken, isLoggedIn, setIsLoggedIn };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


function isTokenExpired(token: string): boolean {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
