// Authentication Enforcement - Ensure Email Verification

export const enforceEmailVerification = async (email: string, password: string) => {
  console.log('🔒 Enforcing email verification for:', email);
  
  try {
    const { supabase } = await import('./supabase-global');
    
    // First, try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError);
      return { 
        success: false, 
        error: signInError.message,
        requiresVerification: false
      };
    }
    
    if (!signInData.user) {
      return { 
        success: false, 
        error: 'No user data returned',
        requiresVerification: false
      };
    }
    
    console.log('👤 User signed in:', {
      id: signInData.user.id,
      email: signInData.user.email,
      email_confirmed_at: signInData.user.email_confirmed_at,
      created_at: signInData.user.created_at
    });
    
    // Check if email is verified
    const isEmailVerified = !!signInData.user.email_confirmed_at;
    
    if (!isEmailVerified) {
      console.log('⚠️ Email not verified, signing out user...');
      
      // Sign out the user since email is not verified
      await supabase.auth.signOut();
      
      return {
        success: false,
        error: 'Email verification required. Please check your email and verify your account before signing in.',
        requiresVerification: true,
        user: {
          id: signInData.user.id,
          email: signInData.user.email,
          email_confirmed_at: signInData.user.email_confirmed_at,
          created_at: signInData.user.created_at
        }
      };
    }
    
    console.log('✅ Email verified, sign in successful');
    return {
      success: true,
      user: signInData.user,
      requiresVerification: false
    };
    
  } catch (error) {
    console.error('❌ Verification enforcement error:', error);
    return {
      success: false,
      error: error.message,
      requiresVerification: false
    };
  }
};

export const checkUserVerificationStatus = async (email: string) => {
  console.log('🔍 Checking verification status for:', email);
  
  try {
    const { supabase } = await import('./supabase-global');
    
    // Get all users to find the specific user
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return { success: false, error: error.message };
    }
    
    const user = users?.find(u => u.email === email);
    
    if (!user) {
      return { 
        success: false, 
        error: 'User not found',
        isVerified: false
      };
    }
    
    const isVerified = !!user.email_confirmed_at;
    
    console.log('📊 User verification status:', {
      email: user.email,
      isVerified: isVerified,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at
    });
    
    return {
      success: true,
      isVerified: isVerified,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at
      }
    };
    
  } catch (error) {
    console.error('❌ Status check error:', error);
    return {
      success: false,
      error: error.message,
      isVerified: false
    };
  }
};
