
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project } from '@/lib/types';
import { format } from 'date-fns';
import { CalendarDays, User, Users, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
  index: number;
  onEditProject: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onEditProject }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'completed':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'on-hold':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const handleCardClick = () => {
    navigate(`/project/${project.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    onEditProject(project);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <div 
        className="block glass card-hover rounded-xl overflow-hidden relative cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 rounded-full hover:bg-black/10"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={handleDropdownClick}>
              <DropdownMenuItem onClick={handleEditClick}>
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Link 
                  to={`/project/${project.id}`} 
                  className="w-full block"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium">{project.name}</h3>
            <span
              className={cn(
                'text-xs px-2 py-1 rounded-full border font-medium',
                getStatusColor(project.status)
              )}
            >
              <span className="capitalize">{project.status}</span>
            </span>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {project.description || `Project for ${project.client}`}
          </p>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              <span>{project.developer}</span>
            </div>
            
            {project.manager && project.manager !== 'Unassigned' && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>{project.manager}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>
                {format(project.startDate, 'MMM d')} - {format(project.endDate, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
