
import React from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddProject: () => void;
}

const ProjectSearch: React.FC<ProjectSearchProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  onAddProject 
}) => {
  return (
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
        onClick={onAddProject}
      >
        <Plus className="h-4 w-4" />
        <span>New Project</span>
      </Button>
    </div>
  );
};

export default ProjectSearch;
