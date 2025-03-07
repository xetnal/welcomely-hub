
import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type ConnectionStatus = 'checking' | 'connected' | 'error';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchTimedOut, setFetchTimedOut] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const { user } = useAuth();

  useEffect(() => {
    console.log('useProjects hook initializing, user status:', user ? 'logged in' : 'not logged in');
    console.log('Supabase project ID:', 'ojleksibqzqzjsjlfmpu');
    console.log('Supabase URL:', 'https://ojleksibqzqzjsjlfmpu.supabase.co');
    
    const debugConnection = async () => {
      console.log('Starting detailed connection diagnostics...');
      
      try {
        // Test basic auth endpoint access
        const { data: authData, error: authError } = await supabase.auth.getSession();
        console.log('Auth check result:', authError ? 'Error' : 'Success', authError || '');
        
        // Test database connection with progressive fallbacks
        await checkSupabaseConnection();
        
        if (connectionStatus !== 'error') {
          fetchProjects();
        } else {
          console.error('Skipping fetchProjects due to connection error');
        }
      } catch (e) {
        console.error('Unexpected error in connection diagnostics:', e);
      }
    };
    
    const timeoutId = setTimeout(() => {
      if (loading && projects.length === 0) {
        console.log('Fetch timed out after 5 seconds');
        setFetchTimedOut(true);
        setLoading(false);
        
        // After timeout, try one more diagnostic attempt
        debugConnection();
      }
    }, 5000);
    
    debugConnection();
    
    return () => clearTimeout(timeoutId);
  }, [user]);

  const checkSupabaseConnection = async () => {
    console.log('Testing Supabase connection with detailed diagnostics...');
    setConnectionStatus('checking');
    
    try {
      // First attempt: RPC call
      console.log('Strategy 1: Testing with RPC ping_db function...');
      const { data: pingData, error: pingError } = await supabase.rpc('ping_db');
      
      if (pingError) {
        console.error('RPC ping failed:', pingError);
        console.log('Error code:', pingError.code);
        console.log('Error message:', pingError.message);
        console.log('Error details:', pingError.details);
        
        // Second attempt: Direct table access
        console.log('Strategy 2: Testing with direct table query...');
        const { data, error } = await supabase
          .from('projects')
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error('Direct table query failed:', error);
          console.log('Error code:', error.code);
          console.log('Error message:', error.message);
          console.log('Error details:', error.details);
          
          // Third attempt: Raw health check
          console.log('Strategy 3: Testing health endpoint...');
          try {
            const response = await fetch('https://ojleksibqzqzjsjlfmpu.supabase.co/rest/v1/', {
              headers: {
                'apikey': supabase.supabaseKey || '',
                'Content-Type': 'application/json'
              }
            });
            console.log('Health check status:', response.status, response.statusText);
            
            if (!response.ok) {
              setConnectionStatus('error');
              setFetchError(`Connection error: Health check failed with status ${response.status}`);
              toast.error(`Database connection error: Health check failed`);
              return false;
            } else {
              console.log('Health check successful');
              setConnectionStatus('connected');
              setFetchError(null);
              return true;
            }
          } catch (fetchError) {
            console.error('Health check fetch failed:', fetchError);
            setConnectionStatus('error');
            setFetchError(`Connection error: Cannot reach Supabase API`);
            toast.error(`Database connection error: Cannot reach Supabase API`);
            return false;
          }
        } else {
          console.log('Direct table query successful:', data);
          setConnectionStatus('connected');
          setFetchError(null);
          return true;
        }
      } else {
        console.log('RPC ping successful:', pingData);
        setConnectionStatus('connected');
        setFetchError(null);
        return true;
      }
    } catch (error: any) {
      console.error('Unexpected error in connection test:', error);
      console.log('Error stack:', error.stack);
      setConnectionStatus('error');
      setFetchError(`Unexpected error: ${error.message || 'Unknown error'}`);
      toast.error(`Connection error: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setFetchTimedOut(false);
      setFetchError(null);
      console.log('Attempting to fetch projects...');
      
      // Add instrumentation to the request
      console.log('Request headers being sent:', {
        'apikey': '[REDACTED]',
        'Authorization': 'Bearer [REDACTED]',
        'Content-Type': 'application/json'
      });
      
      const { data, error, status, statusText } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Log detailed response information
      console.log('Response status:', status, statusText);
      
      if (error) {
        console.error('Error fetching projects:', error);
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        console.log('Error details:', error.details);
        throw error;
      }
      
      console.log('Projects fetched successfully. Data received:', data);
      console.log('Projects count:', data?.length || 0);
      
      if (data && data.length > 0) {
        const transformedProjects: Project[] = data.map(project => ({
          id: project.id,
          name: project.name,
          client: project.client,
          developer: project.developer,
          manager: project.manager || null,
          startDate: new Date(project.start_date),
          endDate: new Date(project.end_date),
          status: project.status,
          description: project.description,
          tasks: [],
          completedStages: project.completed_stages || [],
          user_id: project.user_id
        }));

        console.log('Setting projects state with', transformedProjects.length, 'projects');
        setProjects(transformedProjects);
      } else {
        console.log('No projects found or empty array returned');
        setProjects([]);
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setFetchError(`Error: ${error.message}`);
      toast.error(`Error fetching projects: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (newProject: Project) => {
    try {
      if (!user) {
        toast.error('You must be logged in to create a project');
        return;
      }

      console.log("Attempting to submit project to database:", newProject);
      console.log("User ID being used:", user.id);
      console.log("User session validity:", !!supabase.auth.session);

      const projectData = {
        name: newProject.name,
        client: newProject.client,
        developer: newProject.developer,
        manager: newProject.manager || null,
        description: newProject.description || `Project for ${newProject.client}`,
        start_date: newProject.startDate.toISOString(),
        end_date: newProject.endDate.toISOString(),
        status: newProject.status,
        user_id: user.id,
        completed_stages: []
      };
      
      console.log("Data being sent to Supabase:", projectData);
      
      // Add additional diagnostic info for the insert operation
      console.log("Supabase client ready state:", !!supabase);
      console.log("Target table:", "projects");
      
      const { data, error, status, statusText } = await supabase
        .from('projects')
        .insert(projectData)
        .select();
      
      console.log("Insert response status:", status, statusText);
      
      if (error) {
        console.error("Database insertion error:", error);
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);
        console.log("Error details:", error.details);
        toast.error(`Error creating project: ${error.message}`);
        throw error;
      }
      
      console.log("Project created successfully - result:", data);
      toast.success('Project created successfully');
      
      await fetchProjects();
    } catch (error: any) {
      console.error('Error creating project:', error);
      console.log('Error stack:', error.stack);
      toast.error(`Error creating project: ${error.message}`);
    }
  };

  return {
    projects,
    loading,
    fetchTimedOut,
    fetchError,
    connectionStatus,
    addProject,
    refreshProjects: fetchProjects,
    checkConnection: checkSupabaseConnection
  };
};
