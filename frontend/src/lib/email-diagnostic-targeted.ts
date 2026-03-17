// Targeted Email Verification Diagnostic for Specific Emails

export const diagnoseSpecificEmails = async () => {
  console.group('🔍 TARGETED EMAIL VERIFICATION DIAGNOSTIC');
  
  const testEmails = [
    'sharankurkoti@gmail.com',
    'sharan.kurkoti@yawtllc.com'
  ];
  
  try {
    const { supabase } = await import('./supabase-global');
    
    console.log('\n📧 Analyzing Specific Email Addresses:');
    
    for (const email of testEmails) {
      console.log(`\n--- ${email} ---`);
      
      // Analyze email provider
      const providerInfo = analyzeEmailProvider(email);
      console.log('📧 Provider Info:', providerInfo);
      
      // Check if user exists
      const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();
      
      if (searchError) {
        console.error('❌ Error searching users:', searchError);
        continue;
      }
      
      const existingUser = users?.find(user => user.email === email);
      
      if (existingUser) {
        console.log('👤 User Status:', {
          id: existingUser.id,
          email: existingUser.email,
          email_confirmed_at: existingUser.email_confirmed_at,
          created_at: existingUser.created_at,
          isVerified: !!existingUser.email_confirmed_at,
          last_sign_in_at: existingUser.last_sign_in_at
        });
        
        if (!existingUser.email_confirmed_at) {
          console.log('⚠️ Email not verified - attempting resend...');
          
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          });
          
          if (resendError) {
            console.error('❌ Resend failed:', resendError);
          } else {
            console.log('✅ Resend successful - check email now');
          }
        } else {
          console.log('✅ Email already verified');
        }
      } else {
        console.log('❌ User not found in system');
      }
    }
    
    // Test with a new Gmail account to verify email service is working
    console.log('\n🧪 Testing Email Service with New Gmail Account:');
    const testEmail = `test-${Date.now()}@gmail.com`;
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: { name: 'Test User' },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (signUpError) {
      console.error('❌ Test signup failed:', signUpError);
    } else {
      console.log('✅ Test signup successful');
      console.log('📧 Test email sent to:', testEmail);
      console.log('⏱️ Expected delivery time: 1-5 minutes (Gmail)');
      console.log('🔍 Check spam folder if not received');
    }
    
    console.log('\n🔧 SPECIFIC RECOMMENDATIONS:');
    console.log('1. For sharankurkoti@gmail.com (Gmail):');
    console.log('   - Check Promotions tab');
    console.log('   - Search for "YawtAI" in Gmail');
    console.log('   - Check spam/junk folders');
    console.log('   - Wait 5 minutes before retrying');
    
    console.log('\n2. For sharan.kurkoti@yawtllc.com (Custom Domain):');
    console.log('   - Check spam/junk folders');
    console.log('   - Add no-reply@yawtllc.com to contacts');
    console.log('   - Check with IT department about email filtering');
    console.log('   - Verify domain email service is working');
    
    console.log('\n3. General Troubleshooting:');
    console.log('   - Check Supabase email templates in dashboard');
    console.log('   - Verify email service configuration');
    console.log('   - Try manual verification in Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
  }
  
  console.groupEnd();
};

export const analyzeEmailProvider = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  const providerInfo = {
    'gmail.com': { 
      reliability: 'HIGH', 
      notes: 'Most reliable for verification emails',
      deliveryTime: '1-5 minutes',
      commonIssues: ['Promotions tab', 'Spam folder'],
      solutions: ['Check Promotions tab', 'Mark as important', 'Add to contacts']
    },
    'yawtllc.com': { 
      reliability: 'UNKNOWN', 
      notes: 'Custom domain - depends on email service configuration',
      deliveryTime: 'Unknown',
      commonIssues: ['Spam filtering', 'Domain configuration', 'Email service downtime'],
      solutions: ['Check spam/junk folders', 'Add no-reply@yawtllc.com to contacts', 'Verify domain email service']
    }
  };
  
  const info = providerInfo[domain] || { 
    reliability: 'UNKNOWN', 
    notes: 'Check provider settings',
    deliveryTime: 'Unknown',
    commonIssues: ['Unknown'],
    solutions: ['Check spam folders', 'Add to contacts', 'Try different provider']
  };
  
  return {
    domain,
    ...info
  };
};

export const checkSupabaseEmailService = async () => {
  console.group('🔍 CHECKING SUPABASE EMAIL SERVICE');
  
  try {
    const { supabase } = await import('./supabase-global');
    
    // Test if we can access auth settings
    console.log('📋 Checking email service status...');
    
    // Try to get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
    } else {
      console.log('✅ Auth service working');
    }
    
    console.log('\n🔧 SUPABASE EMAIL SERVICE CHECKLIST:');
    console.log('1. Go to Supabase Dashboard → Authentication');
    console.log('2. Check "Email Templates" section');
    console.log('3. Verify "Confirm signup" template exists');
    console.log('4. Check email content and subject line');
    console.log('5. Go to "Settings" → "Email providers"');
    console.log('6. Verify email service is configured');
    console.log('7. Test email from dashboard if available');
    
    console.log('\n📊 EXPECTED EMAIL CONFIGURATION:');
    console.log('✅ From: no-reply@yourdomain.com');
    console.log('✅ Subject: "Confirm your signup"');
    console.log('✅ Content: Verification link button');
    console.log('✅ Reply-to: support@yourdomain.com');
    
  } catch (error) {
    console.error('❌ Email service check failed:', error);
  }
  
  console.groupEnd();
};
