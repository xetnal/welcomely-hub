
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Priority } from '@/lib/types';
import FormField from './FormField';

interface PrioritySelectProps {
  value: Priority;
  onChange: (value: Priority) => void;
}

const PrioritySelect: React.FC<PrioritySelectProps> = ({ value, onChange }) => {
  return (
    <FormField id="priority" label="Priority">
      <Select
        value={value}
        onValueChange={(value) => onChange(value as Priority)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default PrioritySelect;
