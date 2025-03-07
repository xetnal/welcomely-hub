
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface FormActionsProps {
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
  className?: string;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  onCancel, 
  submitLabel,
  cancelLabel = "Cancel",
  className = "pt-4"
}) => {
  return (
    <DialogFooter className={className}>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button type="submit">
        {submitLabel}
      </Button>
    </DialogFooter>
  );
};

export default FormActions;
