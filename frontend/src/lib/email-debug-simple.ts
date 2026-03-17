// Simplified Email Debug Tools - Singleton Pattern

import { getSupabaseClient } from './supabase-singleton';

export const debugEmailVerification = async () => {
  console.group('🔍 Email Verification Debug');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('VITE_SUPABASE_URL:', (import.meta as any).env?.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  console.log('NODE_ENV:', (import.meta as any).env?.NODE_ENV);
  
  try {
    const supabase = await getSupabaseClient();
    
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Supabase Connection:', authError ? 'FAILED' : 'SUCCESS');
    console.log('Current User:', user ? {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at
    } : 'None');
    
    if (authError) {
      console.error('❌ Supabase connection failed:', authError);
      return {
        success: false,
        error: `Supabase connection failed: ${authError.message}`
      };
    }
    
    console.log('✅ Supabase connection successful');
    
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
    
    if (signUpError) {
      console.error('❌ Signup failed:', signUpError);
      return {
        success: false,
        error: `Signup failed: ${signUpError.message}`
      };
    }
    
    console.log('✅ Email verification system working');
    
    return {
      success: true,
      environment: {
        supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL,
        supabaseKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
        nodeEnv: (import.meta as any).env?.NODE_ENV
      },
      connection: 'SUCCESS',
      currentUser: user,
      testSignup: 'SUCCESS',
      testEmail: testEmail,
      message: 'Email verification system working correctly'
    };
    
  } catch (error) {
    console.error('❌ Debug Error:', error);
    return {
      success: false,
      error: `Debug failed: ${error.message}`
    };
  }
};

export const testEmailVerificationSystem = debugEmailVerification;

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
