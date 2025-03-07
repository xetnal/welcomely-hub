
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
          
          // If we're on the auth page but have a valid session, redirect to home
          if (data.session && location.pathname === '/auth') {
            navigate('/', { replace: true });
          }
          // If we're not on the auth page and have no session, redirect to auth
          else if (!data.session && location.pathname !== '/auth') {
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

    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // When auth state changes to SIGNED_OUT, redirect to login page
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, redirecting to auth page");
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
      
      // Force clear user and session state first
      setUser(null);
      setSession(null);
      
      // Then attempt to sign out from Supabase
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error during sign out:", error);
          // We continue even if there's an error as we've already cleared the local state
          if (error.message !== "Auth session missing!") {
            throw error;
          }
        }
      } catch (supabaseError) {
        console.warn("Supabase sign out error:", supabaseError);
        // We continue anyway as we've already cleared the local state
      }
      
      console.log("Sign out successful");
      toast.success("Signed out successfully");
      
      // Force redirect to auth page
      navigate('/auth', { replace: true });
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(`Error signing out: ${error.message}`);
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
