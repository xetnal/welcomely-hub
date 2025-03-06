import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, Pencil, Plus, User, List, Layout } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PageTransition from '@/components/PageTransition';
import { Project, ProjectStage, Task, TaskStatus } from '@/lib/types';
import StageColumn from '@/components/StageColumn';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskListView from '@/components/TaskListView';
import AddTaskModal from '@/components/AddTaskModal';
import StageProgressBar from '@/components/StageProgressBar';
import StageCompletionButton from '@/components/StageCompletionButton';
import { Toaster, toast } from 'sonner';

const mockProject: Project = {
  id: '1',
  name: 'Website Redesign',
  client: 'Acme Corporation',
  developer: 'Jane Smith',
  startDate: new Date(2023, 7, 15),
  endDate: new Date(2023, 9, 30),
  status: 'active',
  description: 'Complete website redesign with new branding, improved UX, and mobile-first approach.',
  completedStages: [],
  tasks: [
    {
      id: 't1',
      title: 'Create wireframes',
      description: 'Design initial wireframes for homepage and key pages',
      stage: 'Design',
      status: 'In Progress',
      priority: 'high',
      assignee: 'Jane Smith',
      comments: [
        {
          id: 'c1',
          author: 'John Doe',
          content: 'Looks good! Can we add a section for testimonials?',
          timestamp: new Date(2023, 7, 20, 14, 30)
        },
        {
          id: 'c2',
          author: 'Jane Smith',
          content: "Good point, I'll add that to the next iteration.",
          timestamp: new Date(2023, 7, 20, 15, 45)
        }
      ],
      created: new Date(2023, 7, 18),
      updated: new Date(2023, 7, 20)
    },
    {
      id: 't2',
      title: 'Content inventory',
      description: 'Catalog all existing content and identify gaps',
      stage: 'Preparation',
      status: 'Completed',
      priority: 'medium',
      assignee: 'Alex Johnson',
      comments: [],
      created: new Date(2023, 7, 16),
      updated: new Date(2023, 7, 16)
    },
    {
      id: 't3',
      title: 'Competitor analysis',
      description: 'Review competitor websites and identify opportunities',
      stage: 'Analysis',
      status: 'In Review',
      priority: 'medium',
      assignee: 'Jane Smith',
      comments: [
        {
          id: 'c3',
          author: 'Michael Brown',
          content: 'Found three sites we should analyze in detail.',
          timestamp: new Date(2023, 7, 17, 11, 15)
        }
      ],
      created: new Date(2023, 7, 16),
      updated: new Date(2023, 7, 17)
    },
    {
      id: 't4',
      title: 'Setup development environment',
      description: 'Configure development, staging, and production environments',
      stage: 'Development',
      status: 'Completed',
      priority: 'low',
      assignee: 'John Doe',
      comments: [],
      created: new Date(2023, 7, 19),
      updated: new Date(2023, 7, 19)
    },
    {
      id: 't5',
      title: 'Backend API integration',
      description: 'Connect frontend to backend API services',
      stage: 'Development',
      status: 'In Progress',
      priority: 'high',
      assignee: 'John Doe',
      comments: [],
      created: new Date(2023, 7, 22),
      updated: new Date(2023, 7, 22)
    },
    {
      id: 't6',
      title: 'User testing plan',
      description: 'Create test scenarios and recruit test participants',
      stage: 'Testing',
      status: 'Backlog',
      priority: 'medium',
      assignee: 'Emily Chen',
      comments: [],
      created: new Date(2023, 7, 23),
      updated: new Date(2023, 7, 23)
    },
    {
      id: 't7',
      title: 'Stakeholder presentation',
      description: 'Prepare and deliver presentation to key stakeholders',
      stage: 'Preparation',
      status: 'Blocked',
      priority: 'high',
      assignee: 'Jane Smith',
      comments: [],
      created: new Date(2023, 7, 24),
      updated: new Date(2023, 7, 24)
    },
    {
      id: 't8',
      title: 'DNS Configuration',
      description: 'Setup DNS records for the new website',
      stage: 'Go Live',
      status: 'Backlog',
      priority: 'urgent',
      assignee: 'John Doe',
      comments: [
        {
          id: 'c4',
          author: 'Alex Johnson',
          content: 'Do we have access to the domain registrar?',
          timestamp: new Date(2023, 7, 25, 9, 30)
        },
        {
          id: 'c5',
          author: 'John Doe',
          content: 'Yes, credentials are in the shared password manager.',
          timestamp: new Date(2023, 7, 25, 10, 15)
        }
      ],
      created: new Date(2023, 7, 25),
      updated: new Date(2023, 7, 25)
    },
    {
      id: 't9',
      title: 'Client UAT session',
      description: 'Conduct user acceptance testing with the client team',
      stage: 'UAT',
      status: 'In Progress',
      priority: 'high',
      assignee: 'Emily Chen',
      comments: [],
      created: new Date(2023, 7, 26),
      updated: new Date(2023, 7, 26)
    }
  ]
};

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<ProjectStage>('Development');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProject(mockProject);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

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

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    if (!project) return;
    
    console.log(`Moving task ${taskId} to status: ${newStatus}`);
    
    setProject(prevProject => {
      if (!prevProject) return prevProject;

      return {
        ...prevProject,
        tasks: prevProject.tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      };
    });
  }, [project]);

  const addTask = useCallback((newTask: Task) => {
    if (!project) return;
    
    console.log('Adding new task:', newTask);
    
    setProject(prevProject => {
      if (!prevProject) return prevProject;

      return {
        ...prevProject,
        tasks: [...prevProject.tasks, newTask]
      };
    });
  }, [project]);

  const deleteTask = useCallback((taskId: string) => {
    if (!project) return;
    
    console.log(`Deleting task ${taskId}`);
    
    setProject(prevProject => {
      if (!prevProject) return prevProject;

      return {
        ...prevProject,
        tasks: prevProject.tasks.filter(task => task.id !== taskId)
      };
    });
  }, [project]);

  const editTask = useCallback((taskId: string, updatedTask: Partial<Task>) => {
    if (!project) return;
    
    console.log(`Editing task ${taskId}:`, updatedTask);
    
    setProject(prevProject => {
      if (!prevProject) return prevProject;

      return {
        ...prevProject,
        tasks: prevProject.tasks.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      };
    });
  }, [project]);

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

  const toggleStageCompletion = useCallback((stage: ProjectStage) => {
    if (!project) return;

    setProject(prevProject => {
      if (!prevProject) return prevProject;

      const completedStages = prevProject.completedStages || [];
      
      if (completedStages.includes(stage)) {
        return {
          ...prevProject,
          completedStages: completedStages.filter(s => s !== stage)
        };
      } else {
        const newCompletedStages = [...completedStages, stage];
        
        newCompletedStages.sort((a, b) => {
          return stages.indexOf(a) - stages.indexOf(b);
        });
        
        toast.success(`${stage} stage marked as complete`);
        return {
          ...prevProject,
          completedStages: newCompletedStages
        };
      }
    });
  }, [project, stages]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-muted rounded-lg mb-4" />
          <div className="h-6 w-24 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="text-primary hover:underline">
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
                <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors dark:hover:bg-gray-800">
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
                            isStageCompleted={isStageCompleted(stage)}
                          />
                        ))}
                      </div>
                    ) : (
                      <TaskListView tasks={getTasksByStage(stage)} />
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
