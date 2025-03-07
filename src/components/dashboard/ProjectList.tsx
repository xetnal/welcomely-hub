
import React from 'react';
import { motion } from 'framer-motion';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/lib/types';
import EmptyProjectState from './EmptyProjectState';

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  fetchTimedOut: boolean;
  searchQuery: string;
  onAddProject: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  loading, 
  fetchTimedOut,
  searchQuery, 
  onAddProject 
}) => {
  if (loading && !fetchTimedOut) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (projects.length === 0) {
    return (
      <EmptyProjectState 
        searchQuery={searchQuery}
        fetchTimedOut={fetchTimedOut}
        onAddProject={onAddProject}
      />
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </div>
  );
};

export default ProjectList;
