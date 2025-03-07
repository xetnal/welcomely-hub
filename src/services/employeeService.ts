
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
      .from('profiles')
      .select('id, full_name, avatar_url')
      .limit(100);
    
    if (error) {
      throw error;
    }
    
    console.log("Fetched employees:", data);
    
    // Convert profiles to the employee format
    const employees: Employee[] = data.map(profile => ({
      id: profile.id,
      full_name: profile.full_name || 'Unnamed User',
      avatar_url: profile.avatar_url,
      user_id: profile.id // The id in profiles is the user_id
    }));
    
    return employees || [];
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    toast.error('Failed to load employees');
    return [];
  }
};

export const createEmployee = async (userId: string, fullName: string): Promise<Employee | null> => {
  try {
    console.log("Creating/updating profile with userId:", userId, "fullName:", fullName);
    
    // First check if profile already exists to avoid duplicates
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing profile:', checkError);
      throw checkError;
    }
    
    if (existingProfile) {
      console.log("Profile already exists, updating if needed:", existingProfile);
      
      // If the full_name is missing, update it
      if (!existingProfile.full_name) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', userId)
          .select()
          .single();
          
        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }
        
        return {
          id: updatedProfile.id,
          full_name: updatedProfile.full_name || fullName,
          avatar_url: updatedProfile.avatar_url,
          user_id: updatedProfile.id
        };
      }
      
      // Return the existing profile in employee format
      return {
        id: existingProfile.id,
        full_name: existingProfile.full_name || fullName,
        avatar_url: existingProfile.avatar_url,
        user_id: existingProfile.id
      };
    }
    
    // Create the profile if it doesn't exist
    // Note: This should rarely happen since profiles are created by a trigger when users sign up
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        { id: userId, full_name: fullName }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
    
    console.log("Successfully created profile:", data);
    
    // Return in employee format
    return {
      id: data.id,
      full_name: data.full_name || fullName,
      avatar_url: data.avatar_url,
      user_id: data.id
    };
  } catch (error: any) {
    console.error('Error creating/updating profile:', error);
    // Don't show a toast here as this might be called during authentication
    return null;
  }
};
