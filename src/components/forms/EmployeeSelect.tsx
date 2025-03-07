
import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchEmployees, Profile } from '@/services/employeeService';
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
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const profileData = await fetchEmployees();
        
        // Filter out duplicates and prioritize the current user's profile
        const uniqueProfiles = profileData.reduce((acc: Profile[], current) => {
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
        
        setProfiles(uniqueProfiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
        setLoadError('Failed to load profiles');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
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
            <SelectItem disabled value="loading">Loading profiles...</SelectItem>
          ) : loadError ? (
            <SelectItem disabled value="error">{loadError}</SelectItem>
          ) : (
            profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.full_name}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {profile.full_name}
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
