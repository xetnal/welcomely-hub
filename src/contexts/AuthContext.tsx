
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
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to create an employee for a user
  const ensureEmployeeExists = async (userId: string, fullName: string) => {
    try {
      // Check if employee already exists for this user
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }

      // If employee doesn't exist, create one
      if (!data) {
        await createEmployee(userId, fullName);
      }
    } catch (error) {
      console.error('Error ensuring employee exists:', error);
    }
  };

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
        }
        setSession(session);
        setUser(session?.user ?? null);
        
        // If we have a user, ensure they have an employee record
        if (session?.user) {
          const fullName = session.user.user_metadata?.full_name || 'User';
          await ensureEmployeeExists(session.user.id, fullName);
        }
      } catch (error) {
        console.error("Unexpected error during session check:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If we have a user, ensure they have an employee record
        if (session?.user) {
          const fullName = session.user.user_metadata?.full_name || 'User';
          await ensureEmployeeExists(session.user.id, fullName);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      
      if (error) throw error;
      
      // Create employee record for the new user if we have a user
      if (data.user) {
        await createEmployee(data.user.id, fullName);
      }
      
      toast({
        title: "Account created",
        description: "Please check your email for the confirmation link",
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({
        title: "Welcome back",
        description: "You have successfully signed in",
      });
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true); // Set loading to true during sign out
      
      // First, clear the local state regardless of API call success
      setUser(null);
      setSession(null);
      
      try {
        // Now attempt to sign out with Supabase
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error("Error during sign out:", error);
          // Even if there's an error, we've already cleared the local state
        }
      } catch (error: any) {
        // This catch block handles cases where the session might not exist
        console.error("Error during sign out:", error);
        // We've already cleared the local state, so we can continue
      }
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      
      // Redirect to auth page after successful sign out
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Reset loading state
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
