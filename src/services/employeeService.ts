
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
    
    // First try to fetch from profiles table directly instead of employees
    // This ensures we get the most up-to-date data with correct names
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .limit(100);
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }
    
    if (profiles && profiles.length > 0) {
      console.log("Fetched profiles:", profiles);
      
      // Map profiles to employee format
      const employeesFromProfiles = profiles.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unknown User',
        avatar_url: profile.avatar_url
      }));
      
      return employeesFromProfiles;
    }
    
    // Fallback: if no profiles found, try employees table
    const { data: employees, error } = await supabase
      .from('employees')
      .select('id, full_name, avatar_url')
      .limit(100);
    
    if (error) {
      console.error("Error fetching employees:", error);
      throw error;
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
    // Check if user profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (existingProfile) {
      console.log("Profile already exists:", userId);
      // Update the profile with the current name if needed
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating profile name:', updateError);
      }
      return;
    }
    
    // If profile doesn't exist, create it
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName
      }, { onConflict: 'id' });
    
    if (error) {
      console.error('Error creating profile from user:', error);
      throw error;
    }
    
    console.log("Created profile from user:", userId);
  } catch (error: any) {
    console.error('Error in createEmployeeFromUser:', error);
    // Only show toast for actual errors, not on page refresh
    if (error.message !== 'JWT expired') {
      toast.error('Failed to create employee record');
    }
  }
};
