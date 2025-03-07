
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { createEmployee } from '@/services/employeeService';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: (navigate?: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const ensureProfileExists = async (userId: string, fullName: string) => {
    try {
      console.log("Ensuring profile exists for user:", userId, fullName);
      return await createEmployee(userId, fullName);
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        console.log("Checking session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setUser(null);
          setSession(null);
        } else {
          console.log("Session check result:", !!session);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const fullName = session.user.user_metadata?.full_name || 'User';
            console.log("Session user found, ensuring profile exists:", fullName);
            await ensureProfileExists(session.user.id, fullName);
          }
        }
      } catch (error) {
        console.error("Unexpected error during session check:", error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
        console.log("Session check complete, loading set to false");
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed, event:", _event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const fullName = session.user.user_metadata?.full_name || 'User';
          console.log("Auth change user found, ensuring profile exists:", fullName);
          await ensureProfileExists(session.user.id, fullName);
        }
        
        setLoading(false);
        console.log("Auth state change complete, loading set to false");
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      console.log("Signing up user:", email, fullName);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      
      if (error) throw error;
      
      console.log("User signed up successfully:", data);
      
      if (data.user) {
        console.log("Ensuring profile for new user:", data.user.id, fullName);
        const profile = await ensureProfileExists(data.user.id, fullName);
        console.log("Profile status for new signup:", profile);
      } else {
        console.warn("No user object returned from signUp");
      }
      
      toast({
        title: "Account created",
        description: "Please check your email for the confirmation link",
      });
    } catch (error: any) {
      console.error("Error during signup:", error);
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false); // Only reset loading on error as success will trigger auth state change
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Signing in user:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      console.log("User signed in successfully:", data);
      
      toast({
        title: "Welcome back",
        description: "You have successfully signed in",
      });
      
      // Don't reset loading here as the auth state change will handle it
    } catch (error: any) {
      console.error("Error during sign in:", error);
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false); // Only reset loading on error as success will trigger auth state change
      throw error;
    }
  };

  const signOut = async (navigateAfterSignOut = true) => {
    try {
      console.log("Starting sign out process, will navigate:", navigateAfterSignOut);
      setLoading(true);
      
      try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error("Error during sign out:", error);
          throw error;
        }
        
        console.log("Sign out from Supabase successful");
      } catch (error: any) {
        console.error("Error during sign out:", error);
        throw error;
      } finally {
        // Always clear local state regardless of Supabase error
        setUser(null);
        setSession(null);
        console.log("Local auth state cleared");
      }
      
      if (navigateAfterSignOut) {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
        
        console.log("Navigating to auth page after sign out");
        navigate('/auth');
      }
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("Sign out process complete, loading set to false");
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
