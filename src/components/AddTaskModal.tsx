import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProjectStage, Priority } from '@/lib/types';
import { toast } from 'sonner';
import FormField from './forms/FormField';
import FormActions from './forms/FormActions';
import PrioritySelect from './forms/PrioritySelect';
import EmployeeSelect from './forms/EmployeeSelect';
import ClientToggle from './forms/ClientToggle';

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: ProjectStage;
  onAddTask: (newTask: any) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ 
  open, 
  onOpenChange,
  stage,
  onAddTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState('unassigned');
  const [isClientTask, setIsClientTask] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const newTask = {
      id: `t${Date.now()}`,
      title,
      description,
      stage,
      status: 'Backlog' as const,
      priority,
      assignee: assignee !== 'unassigned' ? assignee : undefined,
      comments: [],
      created: new Date(),
      updated: new Date(),
      isClientTask,
    };

    onAddTask(newTask);
    resetForm();
    onOpenChange(false);
    toast.success('Task added successfully');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setAssignee('unassigned');
    setIsClientTask(true);
  };

  const handlePriorityChange = (value: Priority) => {
    setPriority(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Add New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-2">
          <div className="flex items-center justify-between">
            <ClientToggle 
              isClientTask={isClientTask} 
              onToggle={setIsClientTask} 
            />
            <div className="text-sm text-muted-foreground">Stage: {stage}</div>
          </div>
          
          <FormField id="title" label="Title">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </FormField>
          
          <FormField id="description" label="Description">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </FormField>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PrioritySelect value={priority} onChange={handlePriorityChange} />
            <EmployeeSelect
              id="assignee"
              label="Assignee"
              value={assignee}
              onChange={setAssignee}
              defaultOption="unassigned"
              defaultLabel="Unassigned"
            />
          </div>
          
          <FormActions 
            onCancel={() => onOpenChange(false)} 
            submitLabel="Add Task" 
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
