import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://zkqgcqwdonfucsnjstzd.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjkxMWJhYjlhLTQzZjMtNDcyYi1hNzBjLWFlOTU2NzliYmE3NiJ9.eyJwcm9qZWN0SWQiOiJ6a3FnY3F3ZG9uZnVjc25qc3R6ZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzczNTAwNjQ2LCJleHAiOjIwODg4NjA2NDYsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.h6ZhT4rihCkhL62vqIMJ-FhS2HwcUpMvN5pvC0ZZP40';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };