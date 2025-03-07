
import React from 'react';
import { Loader2, WifiOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'checking' | 'connected' | 'error';
  error: string | null;
  onRetryConnection: () => void;
  onRetryFetch: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  error,
  onRetryConnection,
  onRetryFetch
}) => {
  if (status === 'checking') {
    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-600">
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          <p>Testing connection to Supabase...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'connected' && !error) {
    return (
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <p>Connected to database successfully</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    // Determine if it's a path/URL error
    const isPathError = error.toLowerCase().includes('path') || error.toLowerCase().includes('url') || error.toLowerCase().includes('invalid');
    
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p className="font-medium">Database Connection Error</p>
        </div>
        
        <p className="mb-3 text-sm">
          {error}
          {isPathError && (
            <span className="block mt-2 text-xs">
              This could indicate an issue with the Supabase URL or API key configuration. 
              Check that your Supabase credentials are correct.
            </span>
          )}
        </p>
        
        <div className="flex space-x-3">
          <button 
            onClick={onRetryConnection} 
            className="flex items-center text-sm bg-red-100 px-3 py-1.5 rounded hover:bg-red-200 transition-colors"
          >
            <WifiOff className="h-4 w-4 mr-1.5" />
            Test Connection
          </button>
          <button 
            onClick={onRetryFetch} 
            className="flex items-center text-sm bg-red-100 px-3 py-1.5 rounded hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh Data
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default ConnectionStatus;
