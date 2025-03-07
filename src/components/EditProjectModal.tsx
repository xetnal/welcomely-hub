
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Project } from '@/lib/types';
import { toast } from 'sonner';
import FormField from './forms/FormField';
import FormActions from './forms/FormActions';
import EmployeeSelect from './forms/EmployeeSelect';
import StatusSelect from './forms/StatusSelect';

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onEditProject: (projectId: string, updatedProject: Partial<Project>) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  open, 
  onOpenChange,
  project,
  onEditProject
}) => {
  const [name, setName] = useState(project.name);
  const [client, setClient] = useState(project.client);
  const [description, setDescription] = useState(project.description || '');
  const [developer, setDeveloper] = useState(project.developer);
  const [manager, setManager] = useState(project.manager || 'Unassigned');
  const [status, setStatus] = useState<'active' | 'completed' | 'on-hold' | 'inactive'>(
    project.status === 'on-hold' ? 'on-hold' : project.status === 'completed' ? 'completed' : 'active'
  );

  // Reset form fields when the modal opens with current project data
  useEffect(() => {
    if (open) {
      setName(project.name);
      setClient(project.client);
      setDescription(project.description || '');
      setDeveloper(project.developer);
      setManager(project.manager || 'Unassigned');
      setStatus(project.status === 'on-hold' ? 'on-hold' : project.status === 'completed' ? 'completed' : 'active');
    }
  }, [open, project]);

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

    const updatedProject: Partial<Project> = {
      name,
      client,
      description,
      developer,
      manager: manager !== 'Unassigned' ? manager : undefined,
      status: status === 'inactive' ? 'on-hold' : status,
    };

    onEditProject(project.id, updatedProject);
    onOpenChange(false);
  };

  // Handle cancel action - ensure the modal closes properly
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Edit Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-2">
          <FormField id="name" label="Project Name">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </FormField>
          
          <FormField id="client" label="Client Name">
            <Input
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Enter client name"
              required
            />
          </FormField>
          
          <FormField id="description" label="Description">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </FormField>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EmployeeSelect
              id="developer"
              label="Developer in Charge"
              value={developer}
              onChange={setDeveloper}
              defaultOption="Unassigned"
              defaultLabel="Unassigned"
            />
            
            <EmployeeSelect
              id="manager"
              label="Manager in Charge"
              value={manager}
              onChange={setManager}
              defaultOption="Unassigned"
              defaultLabel="Unassigned"
            />
          </div>
          
          <StatusSelect value={status} onChange={setStatus} />
          
          <FormActions 
            onCancel={handleCancel} 
            submitLabel="Save Changes" 
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
