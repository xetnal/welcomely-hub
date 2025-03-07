
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ojleksibqzqzjsjlfmpu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbGVrc2licXpxempzamxmbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTQyOTUsImV4cCI6MjA1Njg5MDI5NX0.YEjRvFGoxVk0Eg0qSUTPQv2eAq5BQbNB588xp5254hM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
