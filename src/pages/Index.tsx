
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
import EditProjectModal from '@/components/EditProjectModal';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const fetchProjects = async (userId: string | undefined) => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data.map(project => ({
    ...project,
    id: project.id,
    name: project.name,
    client: project.client,
    developer: project.developer,
    manager: project.manager,
    startDate: new Date(project.start_date),
    endDate: new Date(project.end_date),
    status: project.status,
    description: project.description || '',
    tasks: []
  })) as Project[];
};

const Index = () => {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => fetchProjects(user?.id),
    enabled: !!user?.id
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again later.",
        variant: "destructive",
      });
      console.error("Error fetching projects:", error);
    }
  }, [error, toast]);

  const handleAddProject = async (newProject: Project) => {
    try {
      const projectForSupabase = {
        name: newProject.name,
        client: newProject.client,
        developer: newProject.developer,
        manager: newProject.manager,
        start_date: newProject.startDate,
        end_date: newProject.endDate,
        status: newProject.status,
        description: newProject.description,
        user_id: user?.id
      };
      
      const { error } = await supabase
        .from('projects')
        .insert(projectForSupabase);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      
      refetch();
      
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create project",
        variant: "destructive",
      });
      console.error("Error creating project:", err);
    }
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditProjectModalOpen(true);
  };

  const handleUpdateProject = async (projectId: string, updatedProject: Partial<Project>) => {
    try {
      const projectForSupabase = {
        name: updatedProject.name,
        client: updatedProject.client,
        developer: updatedProject.developer,
        manager: updatedProject.manager,
        status: updatedProject.status,
        description: updatedProject.description
      };
      
      const { error } = await supabase
        .from('projects')
        .update(projectForSupabase)
        .eq('id', projectId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project updated successfully!",
      });
      
      refetch();
      
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to update project",
        variant: "destructive",
      });
      console.error("Error updating project:", err);
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
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="rounded-xl h-48 animate-pulse bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No projects found</p>
            <Button
              onClick={() => setIsAddProjectModalOpen(true)}
              className="flex items-center gap-1 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create your first project</span>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={index} 
                onEditProject={handleEditProject}
              />
            ))}
          </div>
        )}
      </PageTransition>

      <AddProjectModal
        open={isAddProjectModalOpen}
        onOpenChange={setIsAddProjectModalOpen}
        onAddProject={handleAddProject}
      />

      {selectedProject && (
        <EditProjectModal
          open={isEditProjectModalOpen}
          onOpenChange={setIsEditProjectModalOpen}
          project={selectedProject}
          onEditProject={handleUpdateProject}
        />
      )}
    </div>
  );
};

export default Index;
