
import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchEmployees, Employee } from '@/services/employeeService';
import FormField from './FormField';

interface EmployeeSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  defaultOption?: string;
  defaultLabel?: string;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({ 
  id, 
  label, 
  value, 
  onChange,
  defaultOption = 'unassigned',
  defaultLabel = 'Unassigned'
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const employeeData = await fetchEmployees();
        setEmployees(employeeData);
      } catch (err: any) {
        setError(err.message || 'Failed to load employees');
        console.error('Error in EmployeeSelect:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, []);

  return (
    <FormField id={id} label={label}>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={defaultOption}>{defaultLabel}</SelectItem>
          {isLoading ? (
            <SelectItem disabled value="loading">Loading employees...</SelectItem>
          ) : error ? (
            <SelectItem disabled value="error">Error: {error}</SelectItem>
          ) : employees.length === 0 ? (
            <SelectItem disabled value="no-data">No employees found</SelectItem>
          ) : (
            employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {employee.full_name}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </FormField>
  );
};

export default EmployeeSelect;
