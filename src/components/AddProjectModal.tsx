
import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Project } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProject: (newProject: Project) => void;
}

const employees = [
  { id: '1', name: 'Jane Smith' },
  { id: '2', name: 'John Doe' },
  { id: '3', name: 'Alex Johnson' },
  { id: '4', name: 'Emily Chen' },
  { id: '5', name: 'Michael Brown' },
  { id: '6', name: 'Sarah Williams' },
];

const AddProjectModal: React.FC<AddProjectModalProps> = ({ 
  open, 
  onOpenChange,
  onAddProject
}) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [developer, setDeveloper] = useState('Unassigned');
  const [manager, setManager] = useState('Unassigned');
  const [status, setStatus] = useState<'active' | 'completed' | 'on-hold'>('active');
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a project');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (!client.trim()) {
      toast.error('Please enter a client name');
      return;
    }
    
    console.log("Creating project with user ID:", user.id);
    
    const newProject: Project = {
      id: '', // This will be set by the database
      name,
      client,
      developer: developer === 'Unassigned' ? 'Unassigned' : developer,
      manager: manager === 'Unassigned' ? null : manager, // Explicitly set to null when unassigned
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status,
      tasks: [],
      description: `Project for ${client}`,
      user_id: user.id,
      completedStages: [] // Ensure this is properly initialized
    };

    try {
      onAddProject(newProject);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error('Failed to create project. Please try again.');
    }
  };

  const resetForm = () => {
    setName('');
    setClient('');
    setDeveloper('Unassigned');
    setManager('Unassigned');
    setStatus('active');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new project.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client">Client Name</Label>
            <Input
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Enter client name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="developer">Developer in Charge</Label>
              <Select
                value={developer}
                onValueChange={setDeveloper}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select developer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.name}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {employee.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manager">Manager in Charge</Label>
              <Select
                value={manager}
                onValueChange={setManager}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.name}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {employee.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Project Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as 'active' | 'completed' | 'on-hold')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!user}
            >
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
