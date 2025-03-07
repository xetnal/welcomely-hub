
import React from 'react';
import { motion } from 'framer-motion';

interface StageProgressBarProps {
  percentage: number;
}

const StageProgressBar: React.FC<StageProgressBarProps> = ({ percentage }) => {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Calculate color based on percentage (pale pink to coral gradient)
  const getColor = (percent: number) => {
    if (percent < 30) {
      return 'rgb(255, 204, 204)'; // Light pink
    } else if (percent < 70) {
      return 'rgb(255, 153, 153)'; // Medium pink
    } else {
      return 'rgb(255, 102, 102)'; // Coral
    }
  };

  const progressColor = getColor(normalizedPercentage);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground dark:text-gray-400">
        <span>Overall Progress</span>
        <span>{normalizedPercentage}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${normalizedPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: progressColor }}
        />
      </div>
    </div>
  );
};

export default StageProgressBar;
