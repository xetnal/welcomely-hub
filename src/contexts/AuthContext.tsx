import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast: toastNotification } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("AuthProvider initializing...");
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setUser(null);
          setSession(null);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          console.log("Session check complete", { 
            hasSession: !!data.session,
            user: data.session?.user?.email,
            currentPath: location.pathname
          });
          
          if (data.session && location.pathname === '/auth') {
            navigate('/', { replace: true });
          } else if (!data.session && location.pathname !== '/auth') {
            navigate('/auth', { replace: true });
          }
        }
      } catch (err) {
        console.error("Unexpected error during session check:", err);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Using subscription to track auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        // Update local state with new session information
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, redirecting to auth page");
          // When signed out, force navigate to auth page
          navigate('/auth', { replace: true });
        } else if (event === 'SIGNED_IN' && location.pathname === '/auth') {
          console.log("User signed in, redirecting to home page");
          navigate('/', { replace: true });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      
      if (error) throw error;
      toastNotification({
        title: "Account created",
        description: "Please check your email for the confirmation link",
      });
    } catch (error: any) {
      toastNotification({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in successfully");
    } catch (error: any) {
      toast.error(`Error signing in: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting to sign out");
      setLoading(true);
      
      // Create a new supabase instance to avoid session issues
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("Server sign out response error:", error);
      }
      
      // Thorough cleanup of all Supabase tokens
      // Clear specific Supabase token keys
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      }
      
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key);
        }
      }
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Immediately navigate to auth
      navigate('/auth', { replace: true });
      
      console.log("Sign out successful");
      toast.success("Signed out successfully");
      
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(`Error signing out: ${error.message}`);
      
      // Even on error, ensure we navigate to auth page and clear state
      setUser(null);
      setSession(null);
      navigate('/auth', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
