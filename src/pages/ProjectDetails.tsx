
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, Pencil, Plus, User } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import { Project, ProjectStage, Task } from '@/lib/types';
import StageColumn from '@/components/StageColumn';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for a single project
const mockProject: Project = {
  id: '1',
  name: 'Website Redesign',
  client: 'Acme Corporation',
  developer: 'Jane Smith',
  startDate: new Date(2023, 7, 15),
  endDate: new Date(2023, 9, 30),
  status: 'active',
  description: 'Complete website redesign with new branding, improved UX, and mobile-first approach.',
  tasks: [
    {
      id: 't1',
      title: 'Create wireframes',
      description: 'Design initial wireframes for homepage and key pages',
      stage: 'Design',
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

  useEffect(() => {
    // In a real app, we would fetch the project data from an API
    // For now, we'll simulate a network request
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

  const getTasksByStage = (stage: ProjectStage) => {
    return project.tasks.filter(task => task.stage === stage);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <PageTransition className="flex-1 flex flex-col overflow-hidden">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <p className="text-muted-foreground">Client: {project.client}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{project.developer}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <div className="glass p-4 rounded-lg">
              <h2 className="text-sm font-medium mb-2">Description</h2>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto pb-6">
          <div className="container">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Project Stages</h2>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </Button>
            </div>
            
            <Tabs defaultValue={activeStage} onValueChange={(value) => setActiveStage(value as ProjectStage)} className="w-full">
              <TabsList className="grid grid-cols-7 mb-8">
                {stages.map((stage) => (
                  <TabsTrigger key={stage} value={stage} className="text-center">
                    {stage}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {stages.map((stage) => (
                <TabsContent key={stage} value={stage} className="mt-0 border-0 p-0">
                  <div className="flex gap-6 min-h-[70vh]">
                    <StageColumn
                      stage={stage}
                      tasks={getTasksByStage(stage)}
                      index={0}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default ProjectDetails;
