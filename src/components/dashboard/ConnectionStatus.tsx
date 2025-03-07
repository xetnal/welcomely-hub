
import React from 'react';
import { Loader2, WifiOff, AlertCircle, CheckCircle, RefreshCw, Database, ExternalLink } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'checking' | 'connected' | 'error';
  error: string | null;
  onRetryConnection: () => void;
  onRetryFetch: () => void;
  onTestDirectRequest: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  error,
  onRetryConnection,
  onRetryFetch,
  onTestDirectRequest
}) => {
  if (status === 'checking') {
    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-600">
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          <p>Testing connection to Supabase database...</p>
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
    const isAuthError = error.toLowerCase().includes('auth') || error.toLowerCase().includes('permission') || error.toLowerCase().includes('access');
    const isTimeoutError = error.toLowerCase().includes('timeout') || error.toLowerCase().includes('time out');
    
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
          {isAuthError && (
            <span className="block mt-2 text-xs">
              This could be an authentication or permission issue. 
              Check that your Supabase key has the necessary permissions.
            </span>
          )}
          {isTimeoutError && (
            <span className="block mt-2 text-xs">
              This could indicate network issues or that the Supabase service is temporarily unavailable.
              Try again later or check your network connection.
            </span>
          )}
        </p>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onRetryConnection} 
            className="flex items-center text-sm bg-red-100 px-3 py-1.5 rounded hover:bg-red-200 transition-colors"
          >
            <Database className="h-4 w-4 mr-1.5" />
            Test Connection
          </button>
          <button 
            onClick={onRetryFetch} 
            className="flex items-center text-sm bg-red-100 px-3 py-1.5 rounded hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh Data
          </button>
          <button 
            onClick={onTestDirectRequest} 
            className="flex items-center text-sm bg-red-100 px-3 py-1.5 rounded hover:bg-red-200 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Test Direct API
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default ConnectionStatus;
