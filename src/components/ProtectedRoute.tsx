
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute check:", { user: !!user, loading, path: location.pathname });
  }, [user, loading, location.pathname]);

  // If we're loading, show a loading spinner
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If there's no user after loading completes, redirect to auth
  if (!user) {
    console.log("No authenticated user, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
