import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Project } from '@/lib/types';
import { toast } from 'sonner';
import { fetchEmployees, Employee } from '@/services/employeeService';

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProject: (newProject: Project) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ 
  open, 
  onOpenChange,
  onAddProject
}) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [developer, setDeveloper] = useState('Unassigned');
  const [manager, setManager] = useState('Unassigned');
  const [status, setStatus] = useState<'active' | 'completed' | 'on-hold' | 'inactive'>('inactive');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadEmployees();
    }
  }, [open]);

  const loadEmployees = async () => {
    setIsLoading(true);
    const employeeData = await fetchEmployees();
    setEmployees(employeeData);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (!client.trim()) {
      toast.error('Please enter a client name');
      return;
    }

    // Generate a unique ID using timestamp + random string
    const uniqueId = `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newProject: Project = {
      id: uniqueId,
      name,
      client,
      developer: developer === 'Unassigned' ? 'Unassigned' : developer,
      manager: manager === 'Unassigned' ? undefined : manager, // Only include if not Unassigned
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // Default 3 months duration
      status: status === 'inactive' ? 'on-hold' : status, // Map 'inactive' to 'on-hold' as per type definition
      tasks: [],
      description: `Project for ${client}`
    };

    onAddProject(newProject);
    resetForm();
    onOpenChange(false);
    toast.success('Project created successfully');
  };

  const resetForm = () => {
    setName('');
    setClient('');
    setDeveloper('Unassigned');
    setManager('Unassigned');
    setStatus('inactive');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
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
                  {isLoading ? (
                    <SelectItem disabled value="loading">Loading employees...</SelectItem>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.full_name}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {employee.full_name}
                        </div>
                      </SelectItem>
                    ))
                  )}
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
                  {isLoading ? (
                    <SelectItem disabled value="loading">Loading employees...</SelectItem>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.full_name}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {employee.full_name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Project Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as 'active' | 'completed' | 'on-hold' | 'inactive')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
            <Button type="submit">
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
