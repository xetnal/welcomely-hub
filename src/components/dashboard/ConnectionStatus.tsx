
import React from 'react';

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
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-600">
        <div className="flex items-center">
          <span className="mr-2 animate-spin">⟳</span>
          <p>Testing connection to Supabase...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
        <p className="font-medium">Database Error</p>
        <p className="text-sm">{error}</p>
        <div className="mt-2 space-x-2">
          <button 
            onClick={onRetryConnection} 
            className="text-sm bg-red-100 px-3 py-1 rounded hover:bg-red-200"
          >
            Test Connection
          </button>
          <button 
            onClick={onRetryFetch} 
            className="text-sm bg-red-100 px-3 py-1 rounded hover:bg-red-200"
          >
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default ConnectionStatus;
