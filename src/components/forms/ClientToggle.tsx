
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ClientToggleProps {
  isClientTask: boolean;
  onToggle: (checked: boolean) => void;
}

const ClientToggle: React.FC<ClientToggleProps> = ({ isClientTask, onToggle }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="client-task"
        checked={isClientTask}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="client-task">
        {isClientTask ? 'Client Task' : 'Welcomely Task'}
      </Label>
    </div>
  );
};

export default ClientToggle;
