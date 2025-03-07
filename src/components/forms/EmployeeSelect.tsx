import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchEmployees, Employee } from '@/services/employeeService';
import FormField from './FormField';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      const employeeData = await fetchEmployees();
      
      const uniqueEmployees = employeeData.reduce((acc: Employee[], current) => {
        const x = acc.find(item => item.full_name === current.full_name);
        if (!x) {
          return acc.concat([current]);
        } else {
          if (current.user_id === user?.id) {
            return acc.filter(item => item.full_name !== current.full_name).concat([current]);
          }
          return acc;
        }
      }, []);
      
      setEmployees(uniqueEmployees);
      setIsLoading(false);
    };

    loadEmployees();
  }, [user?.id]);

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
          ) : (
            employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.full_name}>
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
