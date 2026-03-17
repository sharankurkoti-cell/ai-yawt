import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, Loader2, Bug, TestTube, Activity, HelpCircle, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { debugEmailVerification, testEmailVerificationSystem, checkEmailProvider } from '@/lib/email-debug-simple';
import { diagnoseLoadingIssues, suggestQuickFixes } from '@/lib/loading-diagnostic';
import { resetSupabaseClient } from '@/lib/supabase-singleton';
import { runEmailVerificationDiagnostic, checkSupabaseEmailConfig } from '@/lib/email-verification-diagnostic';
import { diagnoseSpecificEmails, checkSupabaseEmailService } from '@/lib/email-diagnostic-targeted';
import { testEmailService, checkSupabaseEmailSettings } from '@/lib/email-service-test';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signUp, signIn, resendVerification } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Reset Supabase client singleton on component mount
  useEffect(() => {
    resetSupabaseClient();
  }, []);

  // Check environment variables
  const checkEnvironment = () => {
    console.log('🔍 Environment Check:');
    console.log('VITE_SUPABASE_URL:', (import.meta as any).env?.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
    console.log('NODE_ENV:', (import.meta as any).env?.NODE_ENV);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const result = await signUp(email, password, name);
        if (result.error) {
          setError(result.error);
        } else if (result.needsVerification) {
          setNeedsVerification(true);
          setSuccess('Account created! Please check your Gmail for the verification link.');
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          onClose();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await resendVerification();
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess('Verification email resent! Please check your inbox.');
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    } catch (err) {
      setError('Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    console.log('🔧 Forgot Password Clicked');
    console.log('📧 Email:', email);
    console.log('🌐 Origin:', window.location.origin);
    
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { supabase } = await import('@/lib/supabase-global');
      console.log('📡 Sending password reset request...');
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      console.log('📧 Password Reset Result:', { error, email, redirectUrl: `${window.location.origin}/reset-password` });

      if (error) {
        console.error('❌ Password Reset Error:', error);
        setError(`Failed to send password reset: ${error.message}`);
      } else {
        console.log('✅ Password reset email sent successfully');
        setSuccess('Password reset link sent! Please check your email.');
      }
    } catch (err) {
      console.error('❌ Password Reset Exception:', err);
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsSignUp(true);
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccess('');
    setNeedsVerification(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
        
        {/* Debug button - only in development */}
        {(import.meta as any).env?.NODE_ENV === 'development' && (
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={() => {
                setDebugMode(!debugMode);
                debugEmailVerification();
              }}
              className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center gap-2"
              title="Run email diagnostics"
            >
              <Bug className="w-4 h-4 text-white" />
              <span className="text-white text-xs">Debug</span>
            </button>
            
            <button
              onClick={async () => {
                console.log('🧪 Running comprehensive email verification test...');
                const results = await testEmailVerificationSystem();
                console.log('📊 Test Results:', results);
              }}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              title="Run comprehensive email test"
            >
              <TestTube className="w-4 h-4 text-white" />
              <span className="text-white text-xs">Test</span>
            </button>
            
            <button
              onClick={() => {
                if (email) {
                  const providerInfo = checkEmailProvider(email);
                  console.log('📧 Email Provider Analysis:', providerInfo);
                }
              }}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
              title="Analyze email provider"
            >
              <Mail className="w-4 h-4 text-white" />
              <span className="text-white text-xs">Analyze</span>
            </button>
            
            <button
              onClick={() => {
                console.log('🔍 Running loading diagnostics...');
                const report = diagnoseLoadingIssues();
                const fixes = suggestQuickFixes(report);
                console.log('🔧 Suggested fixes:', fixes);
              }}
              className="p-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-2"
              title="Diagnose loading issues"
            >
              <Activity className="w-4 h-4 text-white" />
              <span className="text-white text-xs">Diagnose</span>
            </button>
            
            <button
              onClick={async () => {
                console.log('📧 Running comprehensive email verification diagnostic...');
                const results = await runEmailVerificationDiagnostic();
                console.log('📊 Email Verification Results:', results);
                
                if (results.success) {
                  console.log('\n🔧 Email Verification Troubleshooting Steps:');
                  console.log('1. Check your spam/junk folders');
                  console.log('2. Add no-reply@yourdomain.com to contacts');
                  console.log('3. Try Gmail or Outlook for better delivery');
                  console.log('4. Check Supabase email service configuration');
                  console.log('5. Verify email templates in Supabase dashboard');
                }
              }}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              title="Diagnose email verification issues"
            >
              <HelpCircle className="w-4 h-4 text-white" />
              <span className="text-white text-xs">Email Help</span>
            </button>
            
            <button
              onClick={async () => {
                console.log('🎯 Running targeted email diagnostic for specific addresses...');
                await diagnoseSpecificEmails();
                console.log('\n🔧 SPECIFIC RECOMMENDATIONS:');
                console.log('For sharankurkoti@gmail.com: Check Gmail Promotions tab and spam folder');
                console.log('For sharan.kurkoti@yawtllc.com: Check domain email service and spam filters');
              }}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
              title="Diagnose specific email addresses"
            >
              <Target className="w-4 h-4 text-white" />
              <span className="text-white text-xs">Target</span>
            </button>
            
            <button
              onClick={async () => {
                console.log('🔧 Checking Supabase email service configuration...');
                await checkSupabaseEmailService();
              }}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
              title="Check Supabase email service"
            >
              <Activity className="w-4 h-4 text-white" />
              <span className="text-white text-xs">Service</span>
            </button>
            
            <button
              onClick={async () => {
                console.log('📧 Testing email service...');
                await testEmailService();
              }}
              className="p-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors flex items-center gap-2"
              title="Test email service"
            >
              <TestTube className="w-4 h-4 text-white" />
              <span className="text-white text-xs">Test</span>
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Logo and title */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {needsVerification ? 'Verify Your Email' : isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-slate-400 text-sm">
              {needsVerification 
                ? 'We sent a verification link to your email address'
                : isSignUp 
                  ? 'Join YawtAI with any email address' 
                  : 'Welcome back to YawtAI'
              }
            </p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 text-sm font-medium">Success</p>
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Verification screen */}
          {needsVerification ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Check your Email</span>
                </div>
                <p className="text-blue-300 text-sm">
                  We've sent a verification link to <strong>{email}</strong>. 
                  Click the link to verify your account and start using YawtAI.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Resend Verification Email
                </button>
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm font-medium mb-2">🔍 Not seeing the email?</p>
                  <ul className="text-yellow-400 text-sm space-y-1">
                    <li>• Check your spam/junk folder</li>
                    <li>• Add noreply@supabase.co to contacts</li>
                    <li>• Wait up to 30 minutes for delivery</li>
                    <li>• Try a different email address (Gmail recommended)</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setNeedsVerification(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Try Different Email Address
                </button>
              </div>
            </div>
          ) : (
            /* Sign Up / Sign In form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Any email address is supported</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>

              <div className="text-center space-y-2">
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-slate-400 hover:text-purple-400 transition-colors text-sm"
                  >
                    Forgot your password?
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-slate-400 hover:text-purple-400 transition-colors text-sm block"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
