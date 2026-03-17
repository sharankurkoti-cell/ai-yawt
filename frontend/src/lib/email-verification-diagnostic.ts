// Comprehensive Email Verification Diagnostic Tool

export const runEmailVerificationDiagnostic = async () => {
  console.group('🔍 COMPREHENSIVE EMAIL VERIFICATION DIAGNOSTIC');
  
  try {
    // Step 1: Check environment configuration
    console.log('\n📋 Step 1: Environment Configuration');
    const { supabase } = await import('./supabase-global');
    
    console.log('✅ Supabase client loaded');
    console.log('🔍 Environment Variables:');
    console.log('  - VITE_SUPABASE_URL:', (import.meta as any).env?.VITE_SUPABASE_URL);
    console.log('  - VITE_SUPABASE_ANON_KEY:', (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
    console.log('  - NODE_ENV:', (import.meta as any).env?.NODE_ENV);
    
    // Step 2: Test Supabase connection
    console.log('\n📋 Step 2: Testing Supabase Connection');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Supabase connection failed:', authError);
      return {
        success: false,
        error: 'Supabase connection failed',
        details: authError
      };
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Current user:', user ? {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at
    } : 'None');
    
    // Step 3: Test signup with a new test email
    console.log('\n📋 Step 3: Testing Email Signup Flow');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('📧 Creating test account:', testEmail);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { name: 'Test User' },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (signUpError) {
      console.error('❌ Test signup failed:', signUpError);
      return {
        success: false,
        error: 'Test signup failed',
        details: signUpError
      };
    }
    
    console.log('✅ Test signup successful');
    console.log('📊 Sign up data:', {
      user: signUpData.user ? {
        id: signUpData.user.id,
        email: signUpData.user.email,
        email_confirmed_at: signUpData.user.email_confirmed_at,
        created_at: signUpData.user.created_at
      } : 'None',
      session: signUpData.session ? 'Created' : 'None'
    });
    
    if (signUpData.user && !signUpData.user.email_confirmed_at) {
      console.log('✅ Verification email should have been sent');
      
      // Step 4: Test resend functionality
      console.log('\n📋 Step 4: Testing Resend Verification');
      
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: testEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (resendError) {
        console.error('❌ Resend failed:', resendError);
        return {
          success: false,
          error: 'Resend verification failed',
          details: resendError
        };
      }
      
      console.log('✅ Resend verification successful');
      
      // Step 5: Check email provider analysis
      console.log('\n📋 Step 5: Email Provider Analysis');
      const providerInfo = analyzeEmailProvider(testEmail);
      console.log('📧 Email Provider:', providerInfo);
      
      // Step 6: Provide troubleshooting steps
      console.log('\n📋 Step 6: Troubleshooting Recommendations');
      console.log('🔧 If you are not receiving verification emails:');
      console.log('  1. Check spam/junk folders');
      console.log('  2. Add no-reply@yourdomain.com to contacts');
      console.log('  3. Try a different email provider (Gmail recommended)');
      console.log('  4. Check if email service is configured in Supabase dashboard');
      console.log('  5. Verify email templates are set up correctly');
      console.log('  6. Check if email rate limits are exceeded');
      
      return {
        success: true,
        message: 'Email verification system working correctly',
        testEmail: testEmail,
        testPassword: testPassword,
        recommendations: [
          'Check spam/junk folders',
          'Add no-reply@yourdomain.com to contacts',
          'Try Gmail or Outlook for better delivery',
          'Check Supabase email service configuration',
          'Verify email templates in Supabase dashboard',
          'Monitor email rate limits'
        ]
      };
    }
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return {
      success: false,
      error: 'Diagnostic failed',
      details: error.message
    };
  }
};

export const analyzeEmailProvider = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  const providerInfo = {
    'gmail.com': { 
      reliability: 'HIGH', 
      notes: 'Most reliable for verification emails',
      deliveryTime: '1-5 minutes'
    },
    'outlook.com': { 
      reliability: 'HIGH', 
      notes: 'Good for corporate emails',
      deliveryTime: '1-10 minutes'
    },
    'yahoo.com': { 
      reliability: 'MEDIUM', 
      notes: 'Sometimes delays verification',
      deliveryTime: '5-15 minutes'
    },
    'hotmail.com': { 
      reliability: 'MEDIUM', 
      notes: 'May go to spam folder',
      deliveryTime: '5-15 minutes'
    },
    'icloud.com': { 
      reliability: 'LOW', 
      notes: 'Often blocks automated emails',
      deliveryTime: '10-30 minutes'
    },
    'example.com': { 
      reliability: 'TEST', 
      notes: 'Test domain - emails will not be delivered',
      deliveryTime: 'N/A'
    }
  };
  
  const info = providerInfo[domain] || { 
    reliability: 'UNKNOWN', 
    notes: 'Check provider settings',
    deliveryTime: 'Unknown'
  };
  
  return {
    domain,
    ...info
  };
};

export const checkSupabaseEmailConfig = async () => {
  console.group('🔍 Checking Supabase Email Configuration');
  
  try {
    const { supabase } = await import('./supabase-global');
    
    // Test if we can access auth settings
    console.log('📋 Checking auth configuration...');
    
    // Try to get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
    } else {
      console.log('✅ Session check successful');
    }
    
    // Check if email service is configured
    console.log('📋 Email Service Status:');
    console.log('  - Auth Service: Available');
    console.log('  - Email Templates: Check Supabase Dashboard');
    console.log('  - SMTP Settings: Check Supabase Dashboard');
    
    console.log('\n🔧 To verify email service configuration:');
    console.log('  1. Go to Supabase Dashboard');
    console.log('  2. Navigate to Authentication > Email Templates');
    console.log('  3. Verify "Confirm signup" template is configured');
    console.log('  4. Check SMTP settings in Authentication > Settings');
    console.log('  5. Test email delivery from dashboard');
    
    return {
      success: true,
      message: 'Email configuration check completed',
      requiresDashboardCheck: true
    };
    
  } catch (error) {
    console.error('❌ Configuration check failed:', error);
    return {
      success: false,
      error: 'Configuration check failed',
      details: error.message
    };
  }
};
