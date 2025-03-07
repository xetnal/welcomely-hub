
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyProjectStateProps {
  searchQuery: string;
  fetchTimedOut: boolean;
  onAddProject: () => void;
}

const EmptyProjectState: React.FC<EmptyProjectStateProps> = ({ 
  searchQuery, 
  fetchTimedOut,
  onAddProject 
}) => {
  return (
    <div className="text-center p-12 bg-muted/20 rounded-lg border border-dashed">
      <h3 className="text-lg font-medium mb-2">No projects found</h3>
      <p className="text-muted-foreground mb-4">
        {searchQuery 
          ? 'No projects match your search criteria' 
          : fetchTimedOut 
            ? 'No projects found. Please create your first project.' 
            : 'You have not created any projects yet'
        }
      </p>
      <Button onClick={onAddProject}>
        <Plus className="h-4 w-4 mr-2" />
        Create your first project
      </Button>
    </div>
  );
};

export default EmptyProjectState;
