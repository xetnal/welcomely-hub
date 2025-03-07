
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  full_name: string;
  avatar_url?: string;
  user_id?: string;
}

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, full_name, avatar_url, user_id')
      .limit(100);
    
    if (error) {
      throw error;
    }
    
    console.log("Fetched employees:", data);
    return data || [];
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    toast.error('Failed to load employees');
    return [];
  }
};

export const createEmployee = async (userId: string, fullName: string): Promise<Employee | null> => {
  try {
    console.log("Creating employee with userId:", userId, "fullName:", fullName);
    
    // First check if employee already exists to avoid duplicates
    const { data: existingEmployee, error: checkError } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing employee:', checkError);
      throw checkError;
    }
    
    if (existingEmployee) {
      console.log("Employee already exists, returning:", existingEmployee);
      return existingEmployee;
    }
    
    // Create the employee if it doesn't exist
    const { data, error } = await supabase
      .from('employees')
      .insert([
        { user_id: userId, full_name: fullName }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
    
    console.log("Successfully created employee:", data);
    return data;
  } catch (error: any) {
    console.error('Error creating employee:', error);
    // Don't show a toast here as this might be called during authentication
    return null;
  }
};
