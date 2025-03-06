
import React from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { format } from 'date-fns';
import { Check, Clock, AlertTriangle, RotateCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PriorityBadge from './PriorityBadge';

interface TaskListViewProps {
  tasks: Task[];
}

const StatusIcons: Record<TaskStatus, JSX.Element> = {
  'Backlog': <Clock className="h-4 w-4 text-slate-500" />,
  'In Progress': <RotateCw className="h-4 w-4 text-blue-500" />,
  'Blocked': <AlertTriangle className="h-4 w-4 text-red-500" />,
  'In Review': <Clock className="h-4 w-4 text-amber-500" />,
  'Completed': <Check className="h-4 w-4 text-green-500" />
};

const TaskListView: React.FC<TaskListViewProps> = ({ tasks }) => {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Task</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">
                {task.title}
              </TableCell>
              <TableCell>{task.assignee || '—'}</TableCell>
              <TableCell>{task.stage}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {StatusIcons[task.status]}
                  <span>{task.status}</span>
                </div>
              </TableCell>
              <TableCell>
                <PriorityBadge priority={task.priority} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(task.updated, 'MMM d')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskListView;
