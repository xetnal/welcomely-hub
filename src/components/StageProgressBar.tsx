
import React from 'react';
import { motion } from 'framer-motion';

interface StageProgressBarProps {
  percentage: number;
}

const StageProgressBar: React.FC<StageProgressBarProps> = ({ percentage }) => {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Calculate color based on percentage (red to green gradient)
  const getColor = (percent: number) => {
    // Red: rgb(234, 56, 76) to Green: rgb(34, 197, 94)
    const r = Math.round(234 - (234 - 34) * (percent / 100));
    const g = Math.round(56 + (197 - 56) * (percent / 100));
    const b = Math.round(76 + (94 - 76) * (percent / 100));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const progressColor = getColor(normalizedPercentage);

  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${normalizedPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: progressColor }}
      />
    </div>
  );
};

export default StageProgressBar;
