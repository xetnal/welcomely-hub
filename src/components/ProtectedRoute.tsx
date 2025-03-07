
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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
          setSessionUser(null);
        } else {
          setSessionUser(data.session?.user || null);
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
      setIsCheckingSession(false);
    }
  }, [loading]);

  // If we're loading or checking session, show loading spinner
  if (loading || isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-muted rounded-lg mb-4" />
          <div className="h-6 w-24 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page with the intended location
  if (!user && !sessionUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
