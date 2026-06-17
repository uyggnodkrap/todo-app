import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://cavrobdtbxmbcdlfnisi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdnJvYmR0YnhtYmNkbGZuaXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njg1ODYsImV4cCI6MjA5NzI0NDU4Nn0.1AQeZXrOr7uZR1feTwksBXJ9A_582PsQfUCsAw3OawY';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
