
import React from 'react';
import { Task, ProjectStage, TaskStatus } from '@/lib/types';
import TaskCard from './TaskCard';
import { useDrop } from 'react-dnd';
import { Badge } from '@/components/ui/badge';

interface StageColumnProps {
  stage: ProjectStage;
  status: TaskStatus;
  tasks: Task[];
  index: number;
  onDropTask: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string, updatedTask: Partial<Task>) => void;
  onAddComment?: (taskId: string, content: string) => void;
  isStageCompleted?: boolean;
}

const StageColumn: React.FC<StageColumnProps> = ({
  stage,
  status,
  tasks,
  index,
  onDropTask,
  onDeleteTask,
  onEditTask,
  onAddComment,
  isStageCompleted
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string }) => {
      onDropTask(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50';
      case 'In Progress':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50';
      case 'Blocked':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50';
      case 'In Review':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900/50';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'In Review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div 
      ref={drop}
      className={`rounded-lg border p-3 ${getStatusColor(status)} 
        transition-colors ${isOver ? 'ring-2 ring-primary' : ''} 
        ${isStageCompleted && tasks.length > 0 && status !== 'Completed' ? 'ring-2 ring-amber-500' : ''}`}
    >
      <div className="flex justify-between items-center mb-3">
        <Badge variant="outline" className={`${getStatusBadgeColor(status)}`}>
          {status}
        </Badge>
        <span className="text-xs text-muted-foreground dark:text-gray-400">{tasks.length}</span>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task, i) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            index={i}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onAddComment={onAddComment}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="h-20 border border-dashed rounded-lg flex items-center justify-center text-sm text-muted-foreground dark:border-gray-700">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default StageColumn;
