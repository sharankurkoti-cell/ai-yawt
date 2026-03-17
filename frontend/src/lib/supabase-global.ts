// Global Supabase Singleton - True Single Instance Across All Files

import { createClient } from '@supabase/supabase-js';

// Initialize database client with proper error handling
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://zkqgcqwdonfucsnjstzd.databasepad.com';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjkxMWJhYjlhLTQzZjMtNDcyYi1hNzBjLWFlOTU2NzliYmE3NiJ9.eyJwcm9qZWN0SWQiOiJ6a3FnY3F3ZG9uZnVjc25qc3R6ZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzczNTAwNjQ2LCJleHAiOjIwODg4NjA2NDYsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.h6ZhT4rihCkhL62vqIMJ-FhS2HwcUpMvN5pvC0ZZP40';

// Global singleton instance - only created once across entire app
let globalSupabaseInstance = null;
let isInitializing = false;

export const getGlobalSupabaseClient = () => {
  if (globalSupabaseInstance) {
    return globalSupabaseInstance;
  }
  
  if (isInitializing) {
    console.log('⏳ Supabase client initialization in progress, waiting...');
    return null;
  }
  
  isInitializing = true;
  
  try {
    console.log('🔍 Initializing Global Supabase client (TRUE SINGLETON)...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'SET' : 'MISSING');
    
    globalSupabaseInstance = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Global Supabase client initialized (TRUE SINGLETON)');
    return globalSupabaseInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Global Supabase client:', error);
    isInitializing = false;
    throw error;
  }
};

export const resetGlobalSupabaseClient = () => {
  console.log('🔄 Resetting Global Supabase client');
  globalSupabaseInstance = null;
  isInitializing = false;
};

// Export the singleton instance
export const supabase = getGlobalSupabaseClient();
