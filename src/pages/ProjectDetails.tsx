
import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, Pencil, Plus, User, List, Layout } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PageTransition from '@/components/PageTransition';
import { Project, ProjectStage, Task, TaskStatus, Comment } from '@/lib/types';
import StageColumn from '@/components/StageColumn';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskListView from '@/components/TaskListView';
import AddTaskModal from '@/components/AddTaskModal';
import StageProgressBar from '@/components/StageProgressBar';
import StageCompletionButton from '@/components/StageCompletionButton';
import { Toaster, toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const fetchProject = async (projectId: string) => {
  // Fetch project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError) throw new Error(projectError.message);
  
  // Fetch tasks for this project
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*, comments(*)')
    .eq('project_id', projectId);

  if (tasksError) throw new Error(tasksError.message);

  // Transform the tasks to match our frontend Task type
  const formattedTasks = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    stage: task.stage,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee || 'Unassigned',
    isClientTask: task.is_client_task,
    comments: (task.comments || []).map((comment: any) => ({
      id: comment.id,
      author: comment.author,
      content: comment.content,
      timestamp: new Date(comment.created_at)
    })),
    created: new Date(task.created_at),
    updated: new Date(task.updated_at)
  }));

  // Return formatted project data
  return {
    id: project.id,
    name: project.name,
    client: project.client,
    developer: project.developer,
    manager: project.manager || 'Unassigned',
    startDate: new Date(project.start_date),
    endDate: new Date(project.end_date),
    status: project.status,
    description: project.description || '',
    completedStages: project.completed_stages || [],
    tasks: formattedTasks
  } as Project;
};

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeStage, setActiveStage] = useState<ProjectStage>('Development');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id || ''),
    enabled: !!id && !!user,
  });

  // Handle API errors
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to load project details');
      console.error('Error fetching project details:', error);
    }
  }, [error]);

  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string, newStatus: TaskStatus }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', taskId);
      
      if (error) throw error;
      return { taskId, newStatus };
    },
    onSuccess: ({ taskId, newStatus }) => {
      queryClient.setQueryData(['project', id], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          tasks: old.tasks.map((task: Task) => 
            task.id === taskId ? { ...task, status: newStatus, updated: new Date() } : task
          )
        };
      });
      
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update task');
      console.error('Error updating task status:', error);
    }
  });

  const addTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'created' | 'updated' | 'comments'>) => {
      // Format task for Supabase
      const taskForSupabase = {
        title: newTask.title,
        description: newTask.description,
        stage: newTask.stage,
        status: newTask.status,
        priority: newTask.priority,
        assignee: newTask.assignee,
        is_client_task: newTask.isClientTask,
        project_id: id,
        user_id: user?.id
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskForSupabase)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Add new task to the locally cached data
      queryClient.setQueryData(['project', id], (old: any) => {
        if (!old) return old;
        
        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          stage: data.stage,
          status: data.status,
          priority: data.priority,
          assignee: data.assignee || 'Unassigned',
          isClientTask: data.is_client_task,
          comments: [],
          created: new Date(data.created_at),
          updated: new Date(data.updated_at)
        };
        
        return {
          ...old,
          tasks: [...old.tasks, newTask]
        };
      });
      
      toast.success('Task added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add task');
      console.error('Error adding task:', error);
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      return taskId;
    },
    onSuccess: (taskId) => {
      // Remove task from the locally cached data
      queryClient.setQueryData(['project', id], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          tasks: old.tasks.filter((task: Task) => task.id !== taskId)
        };
      });
      
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  });

  const editTaskMutation = useMutation({
    mutationFn: async ({ taskId, updatedTask }: { taskId: string, updatedTask: Partial<Task> }) => {
      // Format task for Supabase
      const taskForSupabase: any = {};
      
      if (updatedTask.title) taskForSupabase.title = updatedTask.title;
      if (updatedTask.description !== undefined) taskForSupabase.description = updatedTask.description;
      if (updatedTask.stage) taskForSupabase.stage = updatedTask.stage;
      if (updatedTask.status) taskForSupabase.status = updatedTask.status;
      if (updatedTask.priority) taskForSupabase.priority = updatedTask.priority;
      if (updatedTask.assignee) taskForSupabase.assignee = updatedTask.assignee;
      if (updatedTask.isClientTask !== undefined) taskForSupabase.is_client_task = updatedTask.isClientTask;
      
      taskForSupabase.updated_at = new Date();
      
      const { error } = await supabase
        .from('tasks')
        .update(taskForSupabase)
        .eq('id', taskId);
      
      if (error) throw error;
      return { taskId, updatedTask };
    },
    onSuccess: ({ taskId, updatedTask }) => {
      // Update task in the locally cached data
      queryClient.setQueryData(['project', id], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          tasks: old.tasks.map((task: Task) => 
            task.id === taskId ? { ...task, ...updatedTask, updated: new Date() } : task
          )
        };
      });
      
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string, content: string }) => {
      const commentData = {
        task_id: taskId,
        author: user?.email || 'Anonymous',
        content,
        user_id: user?.id
      };
      
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();
      
      if (error) throw error;
      return { taskId, comment: data };
    },
    onSuccess: ({ taskId, comment }) => {
      // Add comment to the locally cached data
      queryClient.setQueryData(['project', id], (old: any) => {
        if (!old) return old;
        
        const newComment: Comment = {
          id: comment.id,
          author: comment.author,
          content: comment.content,
          timestamp: new Date(comment.created_at)
        };
        
        return {
          ...old,
          tasks: old.tasks.map((task: Task) => 
            task.id === taskId ? 
            { 
              ...task, 
              comments: [...task.comments, newComment],
              updated: new Date()
            } : task
          )
        };
      });
      
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error('Error adding comment:', error);
    }
  });

  const updateProjectStagesMutation = useMutation({
    mutationFn: async (completedStages: ProjectStage[]) => {
      const { error } = await supabase
        .from('projects')
        .update({ 
          completed_stages: completedStages,
          updated_at: new Date()
        })
        .eq('id', id);
      
      if (error) throw error;
      return completedStages;
    },
    onSuccess: (completedStages) => {
      // Update completed stages in the locally cached data
      queryClient.setQueryData(['project', id], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          completedStages
        };
      });
    },
    onError: (error) => {
      toast.error('Failed to update project stages');
      console.error('Error updating project stages:', error);
    }
  });

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    if (!project) return;
    moveTaskMutation.mutate({ taskId, newStatus });
  }, [project, moveTaskMutation]);

  const addTask = useCallback((newTask: Omit<Task, 'id' | 'created' | 'updated' | 'comments'>) => {
    if (!project) return;
    addTaskMutation.mutate(newTask);
  }, [project, addTaskMutation]);

  const deleteTask = useCallback((taskId: string) => {
    if (!project) return;
    deleteTaskMutation.mutate(taskId);
  }, [project, deleteTaskMutation]);

  const editTask = useCallback((taskId: string, updatedTask: Partial<Task>) => {
    if (!project) return;
    editTaskMutation.mutate({ taskId, updatedTask });
  }, [project, editTaskMutation]);

  const addComment = useCallback((taskId: string, content: string) => {
    if (!project) return;
    addCommentMutation.mutate({ taskId, content });
  }, [project, addCommentMutation]);

  const overallCompletionPercentage = useMemo(() => {
    if (!project) return 0;
    
    const allTasks = project.tasks;
    if (allTasks.length === 0) return 0;
    
    const completedTasks = allTasks.filter(task => task.status === 'Completed');
    return Math.round((completedTasks.length / allTasks.length) * 100);
  }, [project]);

  const stageCompletionPercentage = useMemo(() => {
    if (!project) return 0;
    
    const stageTasks = project.tasks.filter(task => task.stage === activeStage);
    if (stageTasks.length === 0) return 0;
    
    const completedTasks = stageTasks.filter(task => task.status === 'Completed');
    return Math.round((completedTasks.length / stageTasks.length) * 100);
  }, [project, activeStage]);

  const stages: ProjectStage[] = [
    'Preparation',
    'Analysis',
    'Design',
    'Development',
    'Testing',
    'UAT',
    'Go Live'
  ];

  const statuses: TaskStatus[] = [
    'Backlog',
    'In Progress',
    'Blocked',
    'In Review',
    'Completed'
  ];

  const toggleStageCompletion = useCallback((stage: ProjectStage) => {
    if (!project) return;

    const completedStages = project.completedStages || [];
    let newCompletedStages: ProjectStage[];
    
    if (completedStages.includes(stage)) {
      newCompletedStages = completedStages.filter(s => s !== stage);
    } else {
      newCompletedStages = [...completedStages, stage];
      
      // Sort stages to maintain order
      newCompletedStages.sort((a, b) => {
        return stages.indexOf(a) - stages.indexOf(b);
      });
      
      toast.success(`${stage} stage marked as complete`);
    }
    
    updateProjectStagesMutation.mutate(newCompletedStages);
  }, [project, stages, updateProjectStagesMutation]);

  const stageHasWarning = useCallback((stage: ProjectStage) => {
    if (!project || !project.completedStages?.includes(stage)) return false;
    
    const stageTasks = project.tasks.filter(task => task.stage === stage);
    return stageTasks.some(task => task.status !== 'Completed');
  }, [project]);

  const hasWarningsInPreviousStages = useCallback((currentStage: ProjectStage) => {
    if (!project || !project.completedStages) return false;
    
    const previousCompletedStages = project.completedStages.filter(
      stage => stages.indexOf(stage) < stages.indexOf(currentStage)
    );
    
    return previousCompletedStages.some(stage => {
      const stageTasks = project.tasks.filter(task => task.stage === stage);
      return stageTasks.some(task => task.status !== 'Completed');
    });
  }, [project, stages]);

  const isStageCompleted = useCallback((stage: ProjectStage) => {
    return project?.completedStages?.includes(stage) || false;
  }, [project]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-muted rounded-lg mb-4" />
          <div className="h-6 w-24 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/projects" className="text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getTasksByStageAndStatus = (stage: ProjectStage, status: TaskStatus) => {
    return project.tasks.filter(task => task.stage === stage && task.status === status);
  };

  const getTasksByStage = (stage: ProjectStage) => {
    return project.tasks.filter(task => task.stage === stage);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'kanban' ? 'list' : 'kanban');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex flex-col dark:bg-gray-900 dark:text-white">
        <Navbar />
        <Toaster position="top-center" />
        
        <PageTransition className="flex-1 flex flex-col overflow-hidden">
          <div className="container py-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/projects" className="p-2 rounded-full hover:bg-muted transition-colors dark:hover:bg-gray-800">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <p className="text-muted-foreground dark:text-gray-400">Client: {project.client}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                  <User className="h-4 w-4" />
                  <span>{project.developer}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(project.startDate, 'MMM d')} - {format(project.endDate, 'MMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="flex gap-1">
                    <Pencil className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  
                  <Button size="sm" className="flex gap-1">
                    <Check className="h-4 w-4" />
                    <span>Complete</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="glass p-4 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-sm font-medium mb-2">Description</h2>
                <p className="text-sm text-muted-foreground dark:text-gray-400">{project.description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto pb-6">
            <div className="container">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">Project Stages</h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={toggleViewMode}
                  >
                    {viewMode === 'kanban' ? (
                      <>
                        <List className="h-4 w-4" />
                        <span>List View</span>
                      </>
                    ) : (
                      <>
                        <Layout className="h-4 w-4" />
                        <span>Kanban View</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Task</span>
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue={activeStage} onValueChange={(value) => setActiveStage(value as ProjectStage)} className="w-full">
                <TabsList className="grid grid-cols-7 mb-4 dark:bg-gray-800">
                  {stages.map((stage) => (
                    <TabsTrigger 
                      key={stage} 
                      value={stage} 
                      className={`relative text-center dark:data-[state=active]:bg-gray-700 dark:text-gray-200 dark:data-[state=active]:text-white ${
                        hasWarningsInPreviousStages(stage) && stage === activeStage
                          ? 'animate-pulse'
                          : ''
                      }`}
                    >
                      {stage}
                      {hasWarningsInPreviousStages(stage) && stage === activeStage && (
                        <span className="absolute -top-1 -right-1">
                          <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <StageProgressBar percentage={overallCompletionPercentage} />
                    </div>
                    <StageCompletionButton 
                      stage={activeStage}
                      isCompleted={isStageCompleted(activeStage)}
                      hasWarning={stageHasWarning(activeStage)}
                      onToggleCompletion={toggleStageCompletion}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stages.map((stage, index) => (
                      <div 
                        key={stage}
                        className={`text-xs px-2 py-1 rounded-full ${
                          isStageCompleted(stage) 
                            ? stageHasWarning(stage)
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-muted text-muted-foreground dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {stage}
                      </div>
                    ))}
                  </div>
                </div>
                
                {stages.map((stage) => (
                  <TabsContent key={stage} value={stage} className="mt-0 border-0 p-0">
                    {viewMode === 'kanban' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[60vh]">
                        {statuses.map((status, statusIndex) => (
                          <StageColumn
                            key={`${stage}-${status}`}
                            stage={stage}
                            status={status}
                            tasks={getTasksByStageAndStatus(stage, status)}
                            index={statusIndex}
                            onDropTask={moveTask}
                            onAddTask={addTask}
                            onDeleteTask={deleteTask}
                            onEditTask={editTask}
                            onAddComment={addComment}
                            isStageCompleted={isStageCompleted(stage)}
                          />
                        ))}
                      </div>
                    ) : (
                      <TaskListView 
                        tasks={getTasksByStage(stage)} 
                        onAddComment={addComment}
                        onDeleteTask={deleteTask}
                        onEditTask={editTask}
                      />
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </PageTransition>

        <AddTaskModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          stage={activeStage}
          onAddTask={addTask}
        />
      </div>
    </DndProvider>
  );
};

export default ProjectDetails;
