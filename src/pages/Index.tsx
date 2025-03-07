
import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Project } from '@/lib/types';
import Navbar from '@/components/Navbar';
import AddProjectModal from '@/components/AddProjectModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Import new components
import ProjectHeader from '@/components/dashboard/ProjectHeader';
import ProjectSearch from '@/components/dashboard/ProjectSearch';
import ProjectList from '@/components/dashboard/ProjectList';

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchTimedOut, setFetchTimedOut] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { user } = useAuth();

  useEffect(() => {
    console.log('Index component mounted, checking Supabase connection...');
    // Don't use protected property supabaseUrl
    console.log('Supabase client initialized:', !!supabase);
    
    // Check Supabase connection
    checkSupabaseConnection();
    
    // Set a timeout to show "no projects" message if fetch takes too long
    const timeoutId = setTimeout(() => {
      if (loading && projects.length === 0) {
        console.log('Fetch timed out after 5 seconds');
        setFetchTimedOut(true);
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const checkSupabaseConnection = async () => {
    console.log('Testing Supabase connection...');
    setConnectionStatus('checking');
    
    try {
      console.log('Making API request to Supabase...');
      
      // Try a very simple query first to test the connection
      const { data: pingData, error: pingError } = await supabase.rpc('ping_db');
      
      if (pingError) {
        console.error('Ping DB function failed:', pingError);
        // If ping fails, try the count query as a backup
        tryCountQuery();
      } else {
        console.log('Ping successful:', pingData);
        setConnectionStatus('connected');
        fetchProjects();
      }
    } catch (error: any) {
      console.error('Unexpected error in connection test:', error);
      // If an exception occurred, try the count query as a backup
      tryCountQuery();
    }
  };
  
  const tryCountQuery = async () => {
    try {
      console.log('Trying count query as fallback...');
      // Simple count query to check connection
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setConnectionStatus('error');
        setFetchError(`Connection error: ${error.message} (${error.code})`);
        toast.error(`Supabase connection error: ${error.message}`);
      } else {
        console.log('Count query successful, projects count:', count);
        setConnectionStatus('connected');
        fetchProjects();
      }
    } catch (error: any) {
      console.error('Unexpected error in count query:', error);
      console.error('Error object:', JSON.stringify(error, null, 2));
      setConnectionStatus('error');
      setFetchError(`Unexpected connection error: ${error.message}`);
      toast.error(`Connection error: ${error.message}`);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setFetchTimedOut(false);
      setFetchError(null);
      console.log('Fetching all projects...');
      
      // Try a simpler query first
      try {
        console.log('Testing with a simple query first...');
        const { data: testData, error: testError } = await supabase
          .from('projects')
          .select('id')
          .limit(1);
          
        if (testError) {
          console.error('Simple test query failed:', testError);
          throw testError;
        }
        
        console.log('Simple test query succeeded:', testData);
      } catch (testError: any) {
        console.error('Test query error:', testError);
      }
      
      // First, let's check if the projects table exists and has data
      console.log('Checking project count...');
      const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      console.log('Total projects in the database:', count);
      
      if (countError) {
        console.error('Error checking project count:', countError);
        console.error('Count error details:', JSON.stringify(countError, null, 2));
        setFetchError(`Count error: ${countError.message} (${countError.code})`);
        toast.error(`Error checking project count: ${countError.message}`);
        throw countError;
      }
      
      // Fetch all projects without filtering by user_id
      console.log('Attempting to fetch all projects with full query...');
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setFetchError(`Fetch error: ${error.message} (${error.code})`);
        toast.error(`Error fetching projects: ${error.message}`);
        throw error;
      }

      console.log('Projects fetched:', data);
      console.log('Number of projects:', data?.length || 0);
      
      // Log details of each project for debugging
      data?.forEach((project, index) => {
        console.log(`Project ${index + 1}:`, {
          id: project.id,
          name: project.name,
          client: project.client,
          developer: project.developer,
          created_at: project.created_at,
          user_id: project.user_id
        });
      });

      // Transform the data to match our Project type
      const transformedProjects: Project[] = data ? data.map(project => ({
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
      })) : [];

      setProjects(transformedProjects);
    } catch (error: any) {
      console.error('Detailed error fetching projects:', error);
      setFetchError(`Error: ${error.message}`);
      toast.error(`Error fetching projects: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (newProject: Project) => {
    try {
      if (!user) {
        toast.error('You must be logged in to create a project');
        return;
      }

      console.log("Submitting project to database:", newProject);
      console.log("User ID being used:", user.id);

      // Transform Project to database format
      const projectData = {
        name: newProject.name,
        client: newProject.client,
        developer: newProject.developer,
        manager: newProject.manager || null, // Ensure null instead of undefined
        description: newProject.description || `Project for ${newProject.client}`,
        start_date: newProject.startDate.toISOString(),
        end_date: newProject.endDate.toISOString(),
        status: newProject.status,
        user_id: user.id,
        completed_stages: []
      };
      
      console.log("Data being sent to Supabase:", projectData);
      
      // Simplify the insert operation to reduce potential issues
      try {
        console.log("Starting insert operation...");
        
        // Direct insert without race condition
        const { data, error } = await supabase
          .from('projects')
          .insert(projectData)
          .select();
        
        console.log("Insert operation completed");
        
        if (error) {
          console.error("Database insertion error:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          toast.error(`Error creating project: ${error.message} (${error.code})`);
          throw error;
        }
        
        console.log("Project created successfully - result:", data);
        toast.success('Project created successfully');
        
        // Refresh projects from database
        await fetchProjects();
      } catch (insertError: any) {
        console.error("Error during insert operation:", insertError);
        toast.error(`Insert operation failed: ${insertError.message || 'Unknown error'}`);
        throw new Error(`Insert operation failed: ${insertError.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      toast.error(`Error creating project: ${error.message}`);
      console.error('Error creating project:', error);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.developer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <PageTransition className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <ProjectHeader />
          <ProjectSearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            onAddProject={() => setIsAddProjectModalOpen(true)}
          />
        </div>
        
        {connectionStatus === 'checking' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-600">
            <div className="flex items-center">
              <span className="mr-2 animate-spin">⟳</span>
              <p>Testing connection to Supabase...</p>
            </div>
          </div>
        )}
        
        {fetchError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
            <p className="font-medium">Database Error</p>
            <p className="text-sm">{fetchError}</p>
            <div className="mt-2 space-x-2">
              <button 
                onClick={checkSupabaseConnection} 
                className="text-sm bg-red-100 px-3 py-1 rounded hover:bg-red-200"
              >
                Test Connection
              </button>
              <button 
                onClick={fetchProjects} 
                className="text-sm bg-red-100 px-3 py-1 rounded hover:bg-red-200"
              >
                Retry Fetch
              </button>
            </div>
          </div>
        )}
        
        <ProjectList 
          projects={filteredProjects}
          loading={loading}
          fetchTimedOut={fetchTimedOut}
          searchQuery={searchQuery}
          onAddProject={() => setIsAddProjectModalOpen(true)}
        />
      </PageTransition>

      <AddProjectModal
        open={isAddProjectModalOpen}
        onOpenChange={setIsAddProjectModalOpen}
        onAddProject={handleAddProject}
      />
    </div>
  );
};

export default Index;
