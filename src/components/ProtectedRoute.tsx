
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Protected route: Checking session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setCheckError(error.message);
          setSessionUser(null);
        } else {
          setSessionUser(data.session?.user || null);
          if (data.session?.user) {
            console.log("Protected route: Session user found:", data.session.user.email);
          } else {
            console.log("Protected route: No session user found");
          }
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setSessionUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    };

    if (loading) {
      checkSession();
    } else {
      console.log("Protected route: Already checked auth context, user:", user?.email);
      setIsCheckingSession(false);
    }
  }, [loading, user]);

  // If we're loading or checking session, show loading spinner
  if (loading || isCheckingSession) {
    console.log("Protected route: Loading state, showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your session...</p>
        </div>
      </div>
    );
  }

  // If there was an error checking the session
  if (checkError) {
    console.error("Protected route: Session check error:", checkError);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-destructive/15 text-destructive p-6 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2">Session Error</h3>
          <p>{checkError}</p>
          <button 
            onClick={() => window.location.href = '/auth'} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page with the intended location
  if (!user && !sessionUser) {
    console.log("Protected route: No authenticated user found, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  console.log("Protected route: Authentication confirmed, rendering content");
  return <>{children}</>;
};

export default ProtectedRoute;
