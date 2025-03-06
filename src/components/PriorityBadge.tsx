
import React from 'react';
import { cn } from '@/lib/utils';
import { Priority } from '@/lib/types';
import { AlertTriangle, ArrowDown, ArrowUp, Zap } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const getStyles = () => {
    switch (priority) {
      case 'low':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'high':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'urgent':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };
  
  const getIcon = () => {
    switch (priority) {
      case 'low':
        return <ArrowDown className="h-3 w-3" />;
      case 'medium':
        return <ArrowUp className="h-3 w-3" />;
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      case 'urgent':
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border',
        getStyles(),
        className
      )}
    >
      {getIcon()}
      <span className="capitalize">{priority}</span>
    </span>
  );
};

export default PriorityBadge;
