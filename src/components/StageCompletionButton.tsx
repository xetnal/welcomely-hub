
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle } from 'lucide-react';
import { ProjectStage } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StageCompletionButtonProps {
  stage: ProjectStage;
  isCompleted: boolean;
  hasWarning: boolean;
  onToggleCompletion: (stage: ProjectStage) => void;
}

const StageCompletionButton: React.FC<StageCompletionButtonProps> = ({
  stage,
  isCompleted,
  hasWarning,
  onToggleCompletion,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={isCompleted ? "outline" : "default"}
            className={`relative ${
              isCompleted 
                ? 'border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950/30'
                : ''
            }`}
            onClick={() => onToggleCompletion(stage)}
          >
            {isCompleted ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                <span>Completed</span>
              </>
            ) : (
              <span>Mark Complete</span>
            )}
            
            {hasWarning && (
              <span className="absolute -top-1 -right-1">
                <AlertTriangle className="h-4 w-4 text-amber-500 fill-amber-500" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isCompleted 
            ? hasWarning 
              ? 'This stage is marked as complete but has pending tasks' 
              : 'Click to mark as incomplete'
            : 'Mark this stage as complete'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StageCompletionButton;
