
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute check:", { user: !!user, loading, path: location.pathname });
  }, [user, loading, location.pathname]);

  if (loading) {
    // You could return a loading spinner here if needed
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    console.log("No authenticated user, redirecting to /auth");
    // Redirect to the auth page, but save the current location so we can
    // redirect back after authentication
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
