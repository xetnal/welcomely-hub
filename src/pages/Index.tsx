
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Filter } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/lib/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import AddProjectModal from '@/components/AddProjectModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
        completedStages: project.completed_stages || []
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

      // Transform Project to database format
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProject.name,
          client: newProject.client,
          developer: newProject.developer,
          manager: newProject.manager,
          description: newProject.description || `Project for ${newProject.client}`,
          start_date: newProject.startDate.toISOString(),
          end_date: newProject.endDate.toISOString(),
          status: newProject.status,
          user_id: user?.id,
          completed_stages: []
        })
        .select()
        .single();

      if (error) throw error;
      
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
        completedStages: data.completed_stages || []
      };
      
      setProjects(prevProjects => [addedProject, ...prevProjects]);
      toast.success('Project created successfully');
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
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold"
            >
              Project Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground"
            >
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </motion.p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full bg-white/80 border pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button 
              className="flex items-center gap-1"
              onClick={() => setIsAddProjectModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          </div>
        </div>
        
        {loading && !fetchTimedOut ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-muted/20 rounded-lg border border-dashed">
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No projects match your search criteria' : fetchTimedOut ? 
                'No projects found. Please create your first project.' : 
                'You have not created any projects yet'}
            </p>
            <Button onClick={() => setIsAddProjectModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first project
            </Button>
          </div>
        )}
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
