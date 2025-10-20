import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = {
    user: null,
    loading: false,
    signUp: async () => console.warn('Firebase not configured'),
    signIn: async () => console.warn('Firebase not configured'),
    signOut: async () => console.warn('Firebase not configured')
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
