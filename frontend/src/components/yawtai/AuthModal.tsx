import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
          setSuccess('Account created! Please check your email for the verification link.');
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          onClose();
        }
      }
    } catch {
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
    } catch {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { supabase } = await import('@/lib/supabase-global');
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) {
        setError(`Failed to send password reset: ${resetError.message}`);
      } else {
        setSuccess('Password reset link sent! Please check your email.');
      }
    } catch {
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="p-6">
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

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 text-sm font-medium">Success</p>
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

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
                  <p className="text-yellow-300 text-sm font-medium mb-2">Not seeing the email?</p>
                  <ul className="text-yellow-400 text-sm space-y-1">
                    <li>Check your spam/junk folder</li>
                    <li>Add noreply@supabase.co to contacts</li>
                    <li>Wait up to 30 minutes for delivery</li>
                    <li>Try a different email address (Gmail recommended)</li>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Min 6 characters"
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
                  className="text-slate-400 hover:text-purple-400 transition-colors text-sm block mx-auto"
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
