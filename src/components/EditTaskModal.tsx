
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/lib/types';
import { toast } from 'sonner';
import FormField from './forms/FormField';
import FormActions from './forms/FormActions';
import PrioritySelect from './forms/PrioritySelect';
import EmployeeSelect from './forms/EmployeeSelect';
import ClientToggle from './forms/ClientToggle';

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onEditTask: (taskId: string, updatedTask: Partial<Task>) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
  open, 
  onOpenChange,
  task,
  onEditTask
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [assignee, setAssignee] = useState(task.assignee || 'unassigned');
  const [isClientTask, setIsClientTask] = useState(task.isClientTask ?? true);

  // Update form when task changes
  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setAssignee(task.assignee || 'unassigned');
      setIsClientTask(task.isClientTask ?? true);
    }
  }, [open, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const updatedTask: Partial<Task> = {
      title,
      description,
      priority,
      assignee: assignee !== 'unassigned' ? assignee : undefined,
      isClientTask,
      updated: new Date(),
    };

    onEditTask(task.id, updatedTask);
    onOpenChange(false);
    toast.success('Task updated successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Edit Task</DialogTitle>
          {/* Removed the duplicate close button here */}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-2">
          <div className="flex items-center justify-between">
            <ClientToggle 
              isClientTask={isClientTask} 
              onToggle={setIsClientTask} 
            />
            <div className="text-sm text-muted-foreground">Stage: {task.stage}</div>
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
            <PrioritySelect value={priority} onChange={setPriority} />
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
            submitLabel="Save Changes" 
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;
