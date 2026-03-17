// Email Verification Debugging Tools

export const debugEmailVerification = async () => {
  console.group('🔍 Email Verification Debug');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  console.log('NODE_ENV:', import.meta.env.NODE_ENV);
  
  // Test Supabase connection
  try {
    const { supabase } = await import('@/lib/supabase-fixed');
    
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Supabase Connection:', authError ? 'FAILED' : 'SUCCESS');
    console.log('Current User:', user ? {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at
    } : 'None');
    
    // Test signup with a test email
    console.log('\n📧 Testing signup process...');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: { name: 'Test User' },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    console.log('Signup Test:', signUpError ? 'FAILED' : 'SUCCESS');
    if (signUpData.user && !signUpData.user.email_confirmed_at) {
      console.log('✅ Test signup successful - verification email should be sent');
      console.log('Test Email:', testEmail);
      console.log('User ID:', signUpData.user.id);
    }
    
    // Check if we can trigger resend
    if (signUpData.user && !signUpData.user.email_confirmed_at) {
      console.log('\n🔄 Testing resend verification...');
      const resendError = await supabase.auth.resend({
        type: 'signup',
        email: testEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      console.log('Resend Test:', resendError ? 'FAILED' : 'SUCCESS');
    }
    
  } catch (error) {
    console.error('Debug Error:', error);
  }
  
  console.groupEnd();
  
  return {
    environment: {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      nodeEnv: import.meta.env.NODE_ENV
    },
    connection: authError ? 'FAILED' : 'SUCCESS',
    currentUser: user,
    testSignup: signUpError ? 'FAILED' : 'SUCCESS',
    testResend: resendError ? 'FAILED' : 'SUCCESS'
  };
};

export const checkEmailDelivery = async (email: string) => {
  console.log(`\n📧 Checking email delivery for: ${email}`);
  
  try {
    // Check if there are any recent signups for this email
    const { supabase } = await import('@/lib/supabase-fixed');
    
    const { data: profiles, error: profileError } = await supabase
      .from('auth.users')
      .select('email, created_at, email_confirmed_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (profileError) {
      console.error('Profile check failed:', profileError);
      return { success: false, error: profileError.message };
    }
    
    console.log('Email Profiles Found:', profiles?.length || 0);
    
    if (profiles && profiles.length > 0) {
      const latestProfile = profiles[0];
      console.log('Latest Profile:', {
        email: latestProfile.email,
        created_at: latestProfile.created_at,
        confirmed_at: latestProfile.email_confirmed_at,
        isVerified: !!latestProfile.email_confirmed_at
      });
      
      if (latestProfile.email_confirmed_at) {
        console.log('✅ Email has been verified');
        return { 
          success: true, 
          verified: true,
          verifiedAt: latestProfile.email_confirmed_at,
          message: 'Email is already verified'
        };
      } else {
        console.log('⏰ Email created but not verified');
        const timeSinceCreation = new Date(latestProfile.created_at).getTime();
        const now = new Date().getTime();
        const hoursSinceCreation = (now - timeSinceCreation) / (1000 * 60 * 60);
        
        return { 
          success: true, 
          verified: false,
          createdAgo: `${Math.floor(hoursSinceCreation)} hours ago`,
          message: `Email was created ${Math.floor(hoursSinceCreation)} hours ago but not verified`
        };
      }
    } else {
      console.log('❌ No profiles found for this email');
      return { 
        success: false, 
        verified: false,
        message: 'No account found with this email address'
      };
    }
    
  } catch (error) {
    console.error('Email check error:', error);
    return { success: false, error: error.message };
  }
};

export const checkEmailProvider = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  const providerInfo = {
    'gmail.com': { reliability: 'HIGH', notes: 'Most reliable for verification emails' },
    'outlook.com': { reliability: 'HIGH', notes: 'Good for corporate emails' },
    'yahoo.com': { reliability: 'MEDIUM', notes: 'Sometimes delays verification' },
    'hotmail.com': { reliability: 'MEDIUM', notes: 'May go to spam folder' },
    'icloud.com': { reliability: 'LOW', notes: 'Often blocks automated emails' },
  };
  
  const info = providerInfo[domain] || { reliability: 'UNKNOWN', notes: 'Check provider settings' };
  
  console.log('📧 Email Provider Analysis:');
  console.log(`Domain: ${domain}`);
  console.log(`Reliability: ${info.reliability}`);
  console.log(`Notes: ${info.notes}`);
  
  return info;
};

// Add this to your AuthModal to test
export const testEmailVerificationSystem = async () => {
  console.log('\n🚀 Starting Email Verification Diagnostics...\n');
  
  const results = await debugEmailVerification();
  
  console.log('\n📊 Diagnostic Results:');
  console.log('==================');
  console.log('Environment Setup:', results.environment.supabaseKey ? '✅ OK' : '❌ MISSING KEY');
  console.log('Supabase Connection:', results.connection);
  console.log('==================');
  }
  
  return results;
};
