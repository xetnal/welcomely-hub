
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from './FormField';

interface StatusSelectProps {
  value: 'active' | 'completed' | 'on-hold' | 'inactive';
  onChange: (value: 'active' | 'completed' | 'on-hold' | 'inactive') => void;
}

const StatusSelect: React.FC<StatusSelectProps> = ({ value, onChange }) => {
  return (
    <FormField id="status" label="Project Status">
      <Select
        value={value}
        onValueChange={(value) => onChange(value as 'active' | 'completed' | 'on-hold' | 'inactive')}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="on-hold">On Hold</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default StatusSelect;
