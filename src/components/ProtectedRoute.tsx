
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state for a maximum of 2 seconds
  const [showLoading, setShowLoading] = React.useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // If still in initial loading and within time limit, show loading spinner
  if (loading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    toast.error('Please login to access this page');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
