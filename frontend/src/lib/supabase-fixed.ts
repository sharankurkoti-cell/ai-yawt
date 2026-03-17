// Import from global singleton to prevent multiple instances
export { supabase, getGlobalSupabaseClient } from './supabase-global';

// Enhanced auth functions with better error handling (NO VERIFICATION REQUIRED)
export const signUpEnhanced = async (email: string, password: string, name?: string) => {
  try {
    console.log('📧 Attempting signup for:', email);
    const { supabase } = await import('./supabase-global');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('❌ Signup failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Signup successful - NO VERIFICATION REQUIRED');
    return { 
      success: true, 
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        email_verified: true // Always true now
      } : null,
      needsVerification: false // Always false now
    };
  } catch (error) {
    console.error('❌ Signup error:', error);
    return { success: false, error: error.message };
  }
};

export const signInEnhanced = async (email: string, password: string) => {
  try {
    console.log('🔍 Attempting sign in for:', email);
    const { supabase } = await import('./supabase-global');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Sign in failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Sign in successful - NO VERIFICATION CHECK');
    return { 
      success: true, 
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        email_verified: true // Always true now
      } : null
    };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return { success: false, error: error.message };
  }
};

export const resendVerificationEnhanced = async (email: string) => {
  try {
    console.log('🔄 Resending verification for:', email);
    const { supabase } = await import('./supabase-global');
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('❌ Resend failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Verification email resent');
    return { success: true };
  } catch (error) {
    console.error('❌ Resend error:', error);
    return { success: false, error: error.message };
  }
};

// Test function to verify database connection
export const testDatabaseConnection = async () => {
  try {
    console.log('🧪 Testing database connection...');
    
    const { supabase } = await import('./supabase-global');
    
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, created_at, email_confirmed_at')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Database connection successful');
    console.log('Users in database:', data?.length || 0);
    
    return { success: true, data };
  } catch (err) {
    console.error('❌ Database test failed:', err);
    return { success: false, error: err.message };
  }
};
