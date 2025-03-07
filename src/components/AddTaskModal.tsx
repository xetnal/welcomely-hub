
import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Priority, ProjectStage } from '@/lib/types';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: ProjectStage;
  onAddTask: (newTask: any) => void;
}

interface Employee {
  id: string;
  full_name: string;
  avatar_url?: string;
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      // Using a simpler query that doesn't trigger the recursive policy issue
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      console.log("Fetched employees:", data);
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Add New Task</DialogTitle>
          <Button 
            className="absolute right-4 top-4 p-1 h-auto rounded-full" 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="client-task"
                checked={isClientTask}
                onCheckedChange={setIsClientTask}
              />
              <Label htmlFor="client-task">
                {isClientTask ? 'Client Task' : 'Welcomely Task'}
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">Stage: {stage}</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={assignee}
                onValueChange={setAssignee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
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
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
