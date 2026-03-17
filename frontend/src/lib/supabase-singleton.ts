// Singleton Supabase Client to Prevent Multiple Instances

let supabaseInstance = null;
let isInitializing = false;

export const getSupabaseClient = async () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return supabaseInstance;
  }
  
  isInitializing = true;
  
  try {
    const { supabase } = await import('@/lib/supabase-fixed');
    supabaseInstance = supabase;
    console.log('✅ Supabase client initialized (singleton)');
    return supabase;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    isInitializing = false;
    throw error;
  }
};

export const resetSupabaseClient = () => {
  console.log('🔄 Resetting Supabase client singleton');
  supabaseInstance = null;
  isInitializing = false;
};
