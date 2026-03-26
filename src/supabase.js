import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://terbnvctatucyajjsdym.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcmJudmN0YXR1Y3lhampzZHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTEyOTUsImV4cCI6MjA5MDEyNzI5NX0.zh8b5yw0uOW8A7F5jIeFm7jjffYoKKyVXYib4JN7rH0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Insert a survey response into the database.
 */
export async function submitResponse(data) {
  const { error } = await supabase.from('survey_responses').insert([data]);
  if (error) throw error;
}

/**
 * Fetch all survey responses for the results page.
 */
export async function fetchResponses() {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
