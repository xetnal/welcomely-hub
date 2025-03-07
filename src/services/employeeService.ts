
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    console.log("Fetching employees from profiles table");
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .limit(100);
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    console.log("Fetched employees successfully:", data?.length || 0, "records");
    return data || [];
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    toast.error('Failed to load employees: ' + (error.message || 'Unknown error'));
    return [];
  }
};
