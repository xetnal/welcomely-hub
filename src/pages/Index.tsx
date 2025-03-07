
import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/PageTransition';
import { Project } from '@/lib/types';
import Navbar from '@/components/Navbar';
import AddProjectModal from '@/components/AddProjectModal';
import { supabase, fetchProjects as supabaseFetchProjects } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Import components
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
    console.log('Index component mounted, user status:', user ? 'logged in' : 'not logged in');
    
    // Set a timeout to show "no projects" message if fetch takes too long
    const timeoutId = setTimeout(() => {
      if (loading && projects.length === 0) {
        console.log('Fetch timed out after 5 seconds');
        setFetchTimedOut(true);
        setLoading(false);
      }
    }, 5000);
    
    // Check connection and fetch projects
    checkSupabaseConnection();
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Check if we should refetch projects when user changes
  useEffect(() => {
    if (user && connectionStatus === 'connected') {
      console.log('User changed, refetching projects...');
      fetchProjects();
    }
  }, [user, connectionStatus]);

  const checkSupabaseConnection = async () => {
    console.log('Testing Supabase connection...');
    setConnectionStatus('checking');
    
    try {
      // Simple query to check connection
      const { data, error } = await supabase
        .from('projects')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus('error');
        setFetchError(`Connection error: ${error.message}`);
        toast.error(`Database connection error: ${error.message}`);
      } else {
        console.log('Connection test successful');
        setConnectionStatus('connected');
        fetchProjects();
      }
    } catch (error: any) {
      console.error('Unexpected error in connection test:', error);
      setConnectionStatus('error');
      setFetchError(`Unexpected error: ${error.message}`);
      toast.error(`Connection error: ${error.message}`);
    }
  };

  const fetchProjects = async () => {
    if (connectionStatus !== 'connected') {
      console.log('Not fetching projects because connection is not established');
      return;
    }
    
    try {
      setLoading(true);
      setFetchTimedOut(false);
      setFetchError(null);
      console.log('Fetching projects...');
      
      // Use the fetchProjects function from client.ts
      const projectData = await supabaseFetchProjects();
      
      console.log('Projects fetched, transforming data');
      
      // Transform the data to match our Project type
      const transformedProjects: Project[] = projectData.map(project => ({
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
    } catch (error: any) {
      console.error('Error fetching projects:', error);
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
        manager: newProject.manager || null,
        description: newProject.description || `Project for ${newProject.client}`,
        start_date: newProject.startDate.toISOString(),
        end_date: newProject.endDate.toISOString(),
        status: newProject.status,
        user_id: user.id,
        completed_stages: []
      };
      
      console.log("Data being sent to Supabase:", projectData);
      
      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select();
      
      if (error) {
        console.error("Database insertion error:", error);
        toast.error(`Error creating project: ${error.message}`);
        throw error;
      }
      
      console.log("Project created successfully - result:", data);
      toast.success('Project created successfully');
      
      // Refresh projects from database
      await fetchProjects();
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
