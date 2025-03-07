
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    // First try to fetch from employees table
    let { data: employees, error } = await supabase
      .from('employees')
      .select('id, full_name, avatar_url')
      .limit(100);
    
    if (error) {
      throw error;
    }
    
    // If no employees found or empty array, try to fetch from profiles and create employees
    if (!employees || employees.length === 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url');
      
      if (profilesError) {
        throw profilesError;
      }
      
      if (profiles && profiles.length > 0) {
        // Create employees from profiles if they don't exist yet
        const employeeInserts = profiles.map(profile => ({
          id: profile.id,
          full_name: profile.full_name || 'Unknown User',
          avatar_url: profile.avatar_url,
          user_id: profile.id
        }));
        
        const { data: insertedEmployees, error: insertError } = await supabase
          .from('employees')
          .upsert(employeeInserts, { onConflict: 'id' })
          .select();
        
        if (insertError) {
          console.error('Error creating employees:', insertError);
          // Even if insert fails, return the profiles data anyway
          return profiles.map(profile => ({
            id: profile.id,
            full_name: profile.full_name || 'Unknown User',
            avatar_url: profile.avatar_url
          }));
        }
        
        // Fetch the updated employees list
        const { data: updatedEmployees, error: fetchError } = await supabase
          .from('employees')
          .select('id, full_name, avatar_url')
          .limit(100);
        
        if (fetchError) {
          throw fetchError;
        }
        
        employees = updatedEmployees;
      }
    }
    
    console.log("Fetched employees:", employees);
    return employees || [];
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    toast.error('Failed to load employees');
    return [];
  }
};

export const createEmployeeFromUser = async (userId: string, fullName: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('employees')
      .upsert({
        id: userId,
        full_name: fullName,
        user_id: userId
      }, { onConflict: 'id' });
    
    if (error) {
      throw error;
    }
    
    console.log("Created employee from user:", userId);
  } catch (error: any) {
    console.error('Error creating employee from user:', error);
    toast.error('Failed to create employee record');
  }
};
