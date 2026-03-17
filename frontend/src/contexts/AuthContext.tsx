import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signUpEnhanced, signInEnhanced, resendVerificationEnhanced } from '@/lib/supabase-fixed';

interface User {
  id: string;
  email?: string;
  name?: string;
  email_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resendVerification: () => Promise<{ error?: string; success?: boolean }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  showAuthModal: false,
  setShowAuthModal: () => {},
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
  resendVerification: async () => ({}),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          email_verified: session.user.email_confirmed_at ? true : false,
        });
      } else {
        setUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          email_verified: session.user.email_confirmed_at ? true : false,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await signUpEnhanced(email, password, name);
    if (result.success) {
      setUser(result.user);
      setShowAuthModal(false);
    }
    return result;
  };

  const signIn = async (email: string, password: string) => {
  // Use original enhanced sign in without verification enforcement
  const result = await signInEnhanced(email, password);
  
  if (result.success) {
    setUser(result.user);
    setShowAuthModal(false);
  }
  
  return result;
};

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resendVerification = async () => {
    if (!user?.email) {
      return { error: 'No email address found to resend verification.' };
    }
    
    const result = await resendVerificationEnhanced(user.email);
    if (result.error) {
      return { error: result.error };
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, loading, showAuthModal, setShowAuthModal, signUp, signIn, signOut, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
};
