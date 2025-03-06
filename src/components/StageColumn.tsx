
import React, { useState } from 'react';
import { ProjectStage, Task, TaskStatus } from '@/lib/types';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDrop } from 'react-dnd';
import AddTaskModal from './AddTaskModal';

interface StageColumnProps {
  stage: ProjectStage;
  status: TaskStatus;
  tasks: Task[];
  index: number;
  onDropTask: (taskId: string, status: TaskStatus) => void;
  onAddTask?: (newTask: any) => void;
  onDeleteTask?: (taskId: string) => void;
}

const StatusIcons: Record<TaskStatus, string> = {
  'Backlog': 'bg-slate-500',
  'In Progress': 'bg-blue-500',
  'Blocked': 'bg-red-500',
  'In Review': 'bg-amber-500',
  'Completed': 'bg-green-500'
};

const StageColumn: React.FC<StageColumnProps> = ({ 
  stage, 
  status, 
  tasks, 
  index, 
  onDropTask,
  onAddTask,
  onDeleteTask
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string }) => {
      onDropTask(item.id, status);
      return { status };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: [0.22, 1, 0.36, 1]
        }}
        className={`flex-shrink-0 glass rounded-xl flex flex-col h-full ${isOver ? 'bg-muted/50 dark:bg-gray-700/50' : ''} dark:bg-gray-800 dark:border-gray-700`}
        ref={drop}
      >
        <div className="p-3 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${StatusIcons[status]}`}></div>
            <h3 className="font-medium">{status}</h3>
          </div>
          <span className="text-xs px-2 py-1 bg-muted dark:bg-gray-700 rounded-full text-muted-foreground dark:text-gray-300">
            {tasks.length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
          {tasks.map((task, idx) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              index={idx} 
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
        
        <div className="p-3 border-t bg-white/40 dark:bg-gray-800/40 dark:border-gray-700">
          <button 
            className="flex items-center gap-1 text-sm w-full justify-center py-1.5 px-3 rounded-md hover:bg-muted dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </motion.div>

      <AddTaskModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        stage={stage}
        onAddTask={onAddTask || (() => {})}
      />
    </>
  );
};

export default StageColumn;
