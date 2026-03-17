// Comprehensive Email Verification Testing Tool

export const testEmailVerificationSystem = async () => {
  console.group('🔍 COMPREHENSIVE EMAIL VERIFICATION TEST');
  
  // Test 1: Environment Configuration
  console.log('\n📋 Test 1: Environment Configuration');
  const envVars = {
    supabaseUrl: import.meta.env?.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env?.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    nodeEnv: import.meta.env?.NODE_ENV,
    appUrl: import.meta.env?.VITE_APP_URL || window.location.origin
  };
  
  console.log('Environment Variables:', envVars);
  
  if (!envVars.supabaseUrl || !envVars.supabaseKey) {
    console.error('❌ CRITICAL: Missing Supabase configuration');
    return { success: false, error: 'Missing Supabase environment variables' };
  }
  
  try {
    const { supabase } = await import('@/lib/supabase-fixed');
    
    // Test 2: Supabase Connection
    console.log('\n📋 Test 2: Supabase Connection');
    const { data: { user }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Supabase connection failed:', authError);
      return { success: false, error: `Supabase connection failed: ${authError.message}` };
    }
    
    console.log('✅ Supabase connection successful');
    console.log('Current session:', user ? {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at
    } : 'No active session');
    
    // Test 3: Email Service Configuration
    console.log('\n📋 Test 3: Email Service Configuration');
    const testEmail = `test-${Date.now()}@example.com`;
    
    console.log('Testing signup with:', testEmail);
    
    // Test signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: { name: 'Test User' },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (signUpError) {
      console.error('❌ Signup failed:', signUpError);
      return { success: false, error: `Signup failed: ${signUpError.message}` };
    }
    
    console.log('✅ Signup successful, user created:', signUpData.user?.id);
    console.log('Email confirmation status:', signUpData.user?.email_confirmed_at ? 'CONFIRMED' : 'NOT CONFIRMED');
    
    if (!signUpData.user?.email_confirmed_at) {
      console.log('📧 Testing resend verification...');
      
      // Test resend
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: testEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (resendError) {
        console.error('❌ Resend failed:', resendError);
        return { success: false, error: `Resend failed: ${resendError.message}` };
      }
      
      console.log('✅ Resend successful');
    }
    
    // Test 4: Check User Profile
    console.log('\n📋 Test 4: Check User Profile');
    const { data: profiles, error: profileError } = await supabase
      .from('auth.users')
      .select('id, email, created_at, email_confirmed_at, last_sign_in_at')
      .eq('email', testEmail)
      .single();
    
    if (profileError) {
      console.error('❌ Profile check failed:', profileError);
      return { success: false, error: `Profile check failed: ${profileError.message}` };
    }
    
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      console.log('✅ Profile found:', {
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        email_confirmed_at: profile.email_confirmed_at,
        last_sign_in_at: profile.last_sign_in_at,
        is_confirmed: !!profile.email_confirmed_at
      });
    } else {
      console.log('❌ No profile found for test email');
    }
    
    // Test 5: Database Connection
    console.log('\n📋 Test 5: Database Connection');
    try {
      const { data: downloads, error: downloadError } = await supabase
        .from('yawtai_downloads')
        .select('count')
        .single();
      
      if (downloadError) {
        console.error('❌ Database connection failed:', downloadError);
        return { success: false, error: `Database connection failed: ${downloadError.message}` };
      }
      
      console.log('✅ Database connection successful');
      console.log('Downloads table accessible');
    } catch (dbError) {
      console.error('❌ Database test failed:', dbError);
      return { success: false, error: `Database test failed: ${dbError.message}` };
    }
    
    console.log('\n📊 TEST SUMMARY:');
    console.log('==================');
    console.log('Environment:', envVars.supabaseKey ? '✅ CONFIGURED' : '❌ NOT CONFIGURED');
    console.log('Supabase Connection:', authError ? '❌ FAILED' : '✅ SUCCESS');
    console.log('Email Service:', signUpError ? '❌ FAILED' : '✅ SUCCESS');
    console.log('Database Connection:', downloadError ? '❌ FAILED' : '✅ SUCCESS');
    console.log('==================');
    
    console.groupEnd();
    
    return {
      success: true,
      environment: envVars,
      connection: authError ? 'FAILED' : 'SUCCESS',
      emailService: signUpError ? 'FAILED' : 'SUCCESS',
      database: downloadError ? 'FAILED' : 'SUCCESS',
      recommendations: {
        environment: envVars.supabaseKey ? 'OK' : 'SET VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
        supabase: 'Check Supabase dashboard for service status',
        email: 'Check spam folders, try different email provider',
        database: 'Create yawtai_downloads table if missing'
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return { success: false, error: `Test failed: ${error.message}` };
  }
};

// Manual verification function for admin use
export const manuallyVerifyEmail = async (email: string) => {
  console.log(`🔧 Manually verifying email: ${email}`);
  
  try {
    const { supabase } = await import('@/lib/supabase-fixed');
    
    // This would require admin access to the Supabase dashboard
    // For now, we'll provide the SQL to run manually
    const manualSQL = `
      -- Manually verify user email
      UPDATE auth.users 
      SET email_confirmed_at = NOW() 
      WHERE email = '${email}';
    `;
    
    console.log('📋 Manual Verification SQL:');
    console.log(manualSQL);
    console.log('⚠️  Run this in Supabase SQL Editor');
    console.log('⚠️  This requires admin access to the project');
    
    return {
      success: true,
      sql: manualSQL,
      instructions: [
        '1. Go to Supabase Dashboard',
        '2. Navigate to SQL Editor',
        '3. Paste and run the SQL above',
        '4. User should be able to sign in after verification'
      ]
    };
    
  } catch (error) {
    console.error('❌ Manual verification failed:', error);
    return { success: false, error: error.message };
  }
};

// Email provider diagnostics
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
