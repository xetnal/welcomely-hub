
import React from 'react';
import { Task } from '@/lib/types';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';

interface TaskListViewProps {
  tasks: Task[];
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string, updatedTask: Partial<Task>) => void;
  onAddComment?: (taskId: string, content: string) => void;
}

const TaskListView: React.FC<TaskListViewProps> = ({ 
  tasks, 
  onDeleteTask, 
  onEditTask,
  onAddComment
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {tasks.length === 0 ? (
        <motion.div 
          variants={item}
          className="bg-muted dark:bg-gray-800 rounded-lg p-6 text-center"
        >
          <p className="text-muted-foreground dark:text-gray-400">No tasks found in this stage.</p>
        </motion.div>
      ) : (
        tasks.map((task, index) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            index={index}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onAddComment={onAddComment}
          />
        ))
      )}
    </motion.div>
  );
};

export default TaskListView;
