
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type ProjectStage = 
  | 'Preparation'
  | 'Analysis'
  | 'Design'
  | 'Development'
  | 'Testing'
  | 'UAT'
  | 'Go Live';

export type TaskStatus = 
  | 'Backlog'
  | 'In Progress'
  | 'Blocked'
  | 'In Review'
  | 'Completed';

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  stage: ProjectStage;
  status: TaskStatus;
  priority: Priority;
  assignee?: string;
  comments: Comment[];
  created: Date;
  updated: Date;
  isClientTask?: boolean;
  addComment?: (content: string) => void;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  developer: string;
  manager?: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'on-hold';
  tasks: Task[];
  description?: string;
  completedStages?: ProjectStage[];
}
