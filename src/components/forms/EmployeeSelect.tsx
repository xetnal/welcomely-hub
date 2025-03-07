
import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchEmployees, Employee } from '@/services/employeeService';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const employeeData = await fetchEmployees();
        // Make sure we have unique employees by ID
        const uniqueEmployees = Array.from(
          new Map(employeeData.map(employee => [employee.id, employee])).values()
        );
        setEmployees(uniqueEmployees);
      } catch (err) {
        console.error("Error loading employees:", err);
        setError("Failed to load employees");
        toast({
          title: "Error",
          description: "Could not load employee list. Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [toast]);

  return (
    <FormField id={id} label={label}>
      <Select
        value={value}
        onValueChange={onChange}
        defaultValue={defaultOption}
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
          ) : (
            employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {employee.full_name || 'Unknown User'}
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
