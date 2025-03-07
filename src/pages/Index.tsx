
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProjects();
      
      // Set a timeout to show "no projects" message if fetch takes too long
      const timeoutId = setTimeout(() => {
        if (loading && projects.length === 0) {
          console.log('Fetch timed out after 5 seconds');
          setFetchTimedOut(true);
          setLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setFetchTimedOut(false);
      console.log('Fetching projects...');
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      console.log('Projects fetched:', data);

      // Transform the data to match our Project type
      const transformedProjects: Project[] = data ? data.map(project => ({
        id: project.id,
        name: project.name,
        client: project.client,
        developer: project.developer,
        manager: project.manager || undefined,
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
      toast.error(`Error fetching projects: ${error.message}`);
      console.error('Error fetching projects:', error);
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
        manager: newProject.manager,
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
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Project created successfully:", data);
      
      // Add new project to state with correct format
      const addedProject: Project = {
        id: data.id,
        name: data.name,
        client: data.client,
        developer: data.developer,
        manager: data.manager || undefined,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        status: data.status,
        description: data.description,
        tasks: [],
        completedStages: data.completed_stages || [],
        user_id: data.user_id
      };
      
      setProjects(prevProjects => [addedProject, ...prevProjects]);
      toast.success('Project created successfully');
      
      // Refresh projects from database to ensure we have the latest data
      fetchProjects();
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
