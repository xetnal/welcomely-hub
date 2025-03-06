
import React from 'react';
import { ProjectStage, Task } from '@/lib/types';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StageColumnProps {
  stage: ProjectStage;
  tasks: Task[];
  index: number;
}

const StageColumn: React.FC<StageColumnProps> = ({ stage, tasks, index }) => {
  const stageColors: Record<ProjectStage, string> = {
    'Preparation': 'bg-blue-500',
    'Analysis': 'bg-indigo-500',
    'Design': 'bg-violet-500',
    'Development': 'bg-purple-500',
    'Testing': 'bg-pink-500',
    'UAT': 'bg-rose-500',
    'Go Live': 'bg-green-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="flex-shrink-0 w-[280px] glass rounded-xl flex flex-col max-h-full"
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${stageColors[stage]}`}></div>
          <h3 className="font-medium">{stage}</h3>
        </div>
        <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tasks.map((task, idx) => (
          <TaskCard key={task.id} task={task} index={idx} />
        ))}
      </div>
      
      <div className="p-3 border-t bg-white/40">
        <button className="flex items-center gap-1 text-sm w-full justify-center py-1.5 px-3 rounded-md hover:bg-muted transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>
    </motion.div>
  );
};

export default StageColumn;
