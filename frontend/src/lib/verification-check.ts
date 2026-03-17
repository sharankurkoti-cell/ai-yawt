// Email Verification Check Utility

export const checkEmailVerification = async (user: any) => {
  if (!user) {
    return { verified: false, needsVerification: true };
  }
  
  // Check if email is verified
  const isEmailVerified = !!user.email_confirmed_at;
  
  console.log('🔍 Email Verification Check:', {
    email: user.email,
    email_confirmed_at: user.email_confirmed_at,
    verified: isEmailVerified
  });
  
  return {
    verified: isEmailVerified,
    needsVerification: !isEmailVerified,
    user: {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at
    }
  };
};

export const forceVerificationCheck = async (email: string) => {
  console.log('🔧 Forcing verification check for:', email);
  
  try {
    const { supabase } = await import('./supabase-global');
    
    // Get all users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return { success: false, error: error.message };
    }
    
    // Find the specific user
    const user = users?.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ User not found:', email);
      return { success: false, error: 'User not found' };
    }
    
    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    });
    
    // Check verification status
    const isVerified = !!user.email_confirmed_at;
    
    if (!isVerified) {
      console.log('⚠️ Email not verified, attempting to resend verification...');
      
      // Resend verification email
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (resendError) {
        console.error('❌ Resend failed:', resendError);
        return { 
          success: false, 
          verified: false, 
          error: resendError.message,
          needsVerification: true
        };
      }
      
      console.log('✅ Verification email resent successfully');
      return { 
        success: true, 
        verified: false, 
        needsVerification: true,
        message: 'Verification email resent'
      };
    }
    
    console.log('✅ Email is verified');
    return { 
      success: true, 
      verified: true, 
      needsVerification: false
    };
    
  } catch (error) {
    console.error('❌ Verification check failed:', error);
    return { 
      success: false, 
      verified: false, 
      error: error.message,
      needsVerification: true
    };
  }
};
