import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { profileService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  hasProfile: boolean;
  login: (userData: User, hasProfile?: boolean) => void;
  logout: () => void;
  checkProfileStatus: () => Promise<void>;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = localStorage.getItem('soulmate_auth');
      const storedUser = localStorage.getItem('soulmate_user');

      if (storedAuth === 'true' && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(parsedUser);

        // Check profile status on load
        try {
          const profile = await profileService.getByUserId(parsedUser.id);
          setHasProfile(!!profile);
        } catch (e) {
          console.error("Error checking profile status", e);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = (userData: User, hasProfileStatus: boolean = false) => {
    setIsAuthenticated(true);
    setUser(userData);
    setHasProfile(hasProfileStatus);
    localStorage.setItem('soulmate_auth', 'true');
    localStorage.setItem('soulmate_user', JSON.stringify(userData));
  };

  const checkProfileStatus = async () => {
    if (user?.id) {
      try {
        const profile = await profileService.getByUserId(user.id);
        setHasProfile(!!profile);
      } catch (e) {
        console.error("Error checking profile status", e);
        setHasProfile(false);
      }
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setHasProfile(false);
    localStorage.removeItem('soulmate_auth');
    localStorage.removeItem('soulmate_user');
    // Optional: Clear notifications on logout
    // localStorage.removeItem('soulmate_notifications');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, hasProfile, login, logout, checkProfileStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
