import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/lib/types';
import { toast } from 'sonner';
import FormField from './forms/FormField';
import FormActions from './forms/FormActions';
import EmployeeSelect from './forms/EmployeeSelect';
import StatusSelect from './forms/StatusSelect';

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
    
    const newProject: Project = {
      id: crypto.randomUUID(), // Generate a proper UUID
      name,
      client,
      developer: developer === 'Unassigned' ? 'Unassigned' : developer,
      manager: manager === 'Unassigned' ? undefined : manager,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: status === 'inactive' ? 'on-hold' : status,
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
            onCancel={() => onOpenChange(false)} 
            submitLabel="Create Project" 
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
