
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.log("No active session, returning empty employees array");
      return [];
    }
    
    // First try to fetch from employees table
    let { data: employees, error } = await supabase
      .from('employees')
      .select('id, full_name, avatar_url')
      .limit(100);
    
    if (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
    
    // If no employees found or empty array, try to fetch from profiles and create employees
    if (!employees || employees.length === 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
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
        
        // Only proceed with upsert if there are profiles to insert
        if (employeeInserts.length > 0) {
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
        }
        
        // Fetch the updated employees list
        const { data: updatedEmployees, error: fetchError } = await supabase
          .from('employees')
          .select('id, full_name, avatar_url')
          .limit(100);
        
        if (fetchError) {
          console.error("Error fetching updated employees:", fetchError);
          throw fetchError;
        }
        
        employees = updatedEmployees;
      }
    }
    
    console.log("Fetched employees:", employees);
    return employees || [];
  } catch (error: any) {
    console.error('Error in fetchEmployees:', error);
    // Don't show toast on page refresh/initial load
    if (error.message !== 'JWT expired') {
      toast.error('Failed to load employees');
    }
    return [];
  }
};

export const createEmployeeFromUser = async (userId: string, fullName: string): Promise<void> => {
  try {
    // Check if employee already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (existingEmployee) {
      console.log("Employee already exists:", userId);
      return;
    }
    
    const { error } = await supabase
      .from('employees')
      .upsert({
        id: userId,
        full_name: fullName,
        user_id: userId
      }, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating employee from user:', error);
      throw error;
    }
    
    console.log("Created employee from user:", userId);
  } catch (error: any) {
    console.error('Error in createEmployeeFromUser:', error);
    // Only show toast for actual errors, not on page refresh
    if (error.message !== 'JWT expired') {
      toast.error('Failed to create employee record');
    }
  }
};
