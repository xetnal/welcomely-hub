
import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { format } from 'date-fns';
import { MessageCircle, MoreHorizontal } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CommentSection from './CommentSection';

interface TaskCardProps {
  task: Task;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="bg-white rounded-lg border shadow-sm p-4 mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{task.title}</h3>
        <div className="flex gap-2 items-center">
          <PriorityBadge priority={task.priority} />
          <Popover>
            <PopoverTrigger>
              <button className="p-1 rounded-full hover:bg-muted text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-1">
                <button className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted">
                  Edit Task
                </button>
                <button className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted">
                  Move to Another Stage
                </button>
                <button className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted text-red-500">
                  Delete Task
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
        <span>Updated {format(task.updated, 'MMM d')}</span>
        {task.assignee && (
          <span className="bg-muted px-2 py-1 rounded">{task.assignee}</span>
        )}
      </div>
      
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <MessageCircle className="h-3 w-3" />
        <span>{task.comments.length} comments</span>
      </button>
      
      {showComments && (
        <div className="mt-3 pt-3 border-t">
          <CommentSection task={task} />
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;
