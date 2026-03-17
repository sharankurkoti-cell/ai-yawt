// Email Service Test - Debug Email Issues

export const testEmailService = async () => {
  console.group('🔧 EMAIL SERVICE TEST');
  
  try {
    const { supabase } = await import('./supabase-global');
    
    console.log('📧 Testing Supabase Email Service...');
    
    // Test 1: Check if we can access auth
    console.log('\n1. Testing Auth Access...');
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('✅ Auth Access:', { session: !!session, error: sessionError });
    } catch (err) {
      console.error('❌ Auth Access Failed:', err);
    }
    
    // Test 2: Test password reset with test email
    console.log('\n2. Testing Password Reset...');
    const testEmail = 'test-reset@example.com';
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (resetError) {
        console.error('❌ Password Reset Failed:', resetError);
        console.log('💡 Possible Causes:');
        console.log('   - Email service not configured in Supabase');
        console.log('   - Invalid redirect URL');
        console.log('   - Supabase project settings issue');
      } else {
        console.log('✅ Password Reset Request Sent');
      }
    } catch (err) {
      console.error('❌ Password Reset Exception:', err);
    }
    
    // Test 3: Test signup verification
    console.log('\n3. Testing Signup Verification...');
    const testSignupEmail = `test-${Date.now()}@example.com`;
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testSignupEmail,
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (signUpError) {
        console.error('❌ Signup Failed:', signUpError);
      } else {
        console.log('✅ Signup Request Sent');
        console.log('📧 Test verification email sent to:', testSignupEmail);
      }
    } catch (err) {
      console.error('❌ Signup Exception:', err);
    }
    
    // Test 4: Check Supabase configuration
    console.log('\n4. Checking Supabase Configuration...');
    console.log('🔗 Supabase URL:', (import.meta as any).env?.VITE_SUPABASE_URL || 'https://zkqgcqwdonfucsnjstzd.databasepad.com');
    console.log('🔑 Supabase Key:', (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Go to Supabase Dashboard → Authentication');
    console.log('2. Check "Email Templates" section');
    console.log('3. Verify "Confirm signup" template exists');
    console.log('4. Go to "Settings" → "Email providers"');
    console.log('5. Verify email service is configured');
    console.log('6. Check "Site URL" in Supabase settings');
    console.log('7. Test email from Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Email Service Test Failed:', error);
  }
  
  console.groupEnd();
};

export const checkSupabaseEmailSettings = async () => {
  console.group('🔍 SUPABASE EMAIL SETTINGS CHECK');
  
  try {
    const { supabase } = await import('./supabase-global');
    
    // Get current session to check user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('👤 Current User:', {
        id: session.user.id,
        email: session.user.email,
        email_confirmed_at: session.user.email_confirmed_at,
        created_at: session.user.created_at
      });
      
      if (!session.user.email_confirmed_at) {
        console.log('⚠️ EMAIL NOT VERIFIED');
        console.log('🔄 Attempting to resend verification...');
        
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: session.user.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (resendError) {
          console.error('❌ Resend Failed:', resendError);
        } else {
          console.log('✅ Verification Email Resent');
        }
      } else {
        console.log('✅ EMAIL VERIFIED');
      }
    } else {
      console.log('ℹ️ No active session');
    }
    
  } catch (error) {
    console.error('❌ Settings Check Failed:', error);
  }
  
  console.groupEnd();
};
