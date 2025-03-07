
import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const ProjectHeader: React.FC = () => {
  return (
    <div>
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold"
      >
        Project Dashboard
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-muted-foreground"
      >
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </motion.p>
    </div>
  );
};

export default ProjectHeader;
