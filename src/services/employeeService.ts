
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
    
    console.log("Created employee:", data);
    return data;
  } catch (error: any) {
    console.error('Error creating employee:', error);
    // Don't show a toast here as this might be called during authentication
    return null;
  }
};

