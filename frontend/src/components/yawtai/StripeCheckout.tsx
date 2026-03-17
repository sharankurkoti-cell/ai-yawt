import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Lock, Check, ArrowLeft, Loader2, Shield,
  Zap, Crown, Users, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  icon: React.ElementType;
  gradient: string;
}

const plans: Plan[] = [
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      'Unlimited AI chat messages',
      'Unlimited debug analyses',
      '50 project generations/month',
      '20 repository analyses/month',
      'Priority email support',
      'Priority responses (2x faster)',
      'Custom templates',
    ],
    icon: Zap,
    gradient: 'from-purple-500 to-blue-500',
  },
  {
    id: 'team_monthly',
    name: 'Team',
    price: 79,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited project generations',
      'Unlimited repository analyses',
      'Dedicated support',
      'Priority responses (3x faster)',
      'Custom templates & sharing',
      'Team collaboration (up to 10)',
      'API access (10K req/month)',
    ],
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
  },
];

const StripeCheckout: React.FC = () => {
  const { user, setShowAuthModal } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [cardComplete, setCardComplete] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="bg-slate-950 text-white pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign in to subscribe</h2>
          <p className="text-slate-400 mb-8">Create an account or sign in to choose a plan and start your subscription.</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-xl shadow-purple-500/25"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-slate-950 text-white pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Subscription Activated!</h2>
          <p className="text-slate-400 mb-8">
            Your {selectedPlan?.name} plan is now active. You have access to all {selectedPlan?.name} features.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              Go to Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/demo"
              className="px-8 py-3 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              Start Using YawtAI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setLoading(true);

    // Simulate Stripe checkout process
    // In production, this would call your backend to create a Stripe Checkout Session
    // and redirect to Stripe's hosted checkout page
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <div className="bg-slate-950 text-white pt-24 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/pricing"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pricing
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-slate-400">Select a plan and complete your subscription with secure Stripe payment.</p>
        </div>

        {!selectedPlan ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className="group bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6 text-left hover:border-purple-500/30 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <div className="text-sm text-slate-400">
                      <span className="text-2xl font-bold text-white">${plan.price}</span>/mo
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 font-medium text-sm group-hover:bg-purple-500/20 transition-all">
                  Select {plan.name} <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            {/* Selected Plan Summary */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedPlan.gradient} flex items-center justify-center shadow-lg`}>
                    <selectedPlan.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{selectedPlan.name} Plan</h3>
                    <p className="text-xs text-slate-500">Billed monthly</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">${selectedPlan.price}</div>
                  <div className="text-xs text-slate-500">/month</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-xs text-slate-400 hover:text-purple-400 transition-colors"
              >
                Change plan
              </button>
            </div>

            {/* Payment Form */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                Payment Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      onChange={(e) => setCardComplete(e.target.value.replace(/\s/g, '').length >= 16)}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors pr-12"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      maxLength={7}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCheckout}
                    disabled={loading || !cardComplete}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Subscribe — ${selectedPlan.price}/month
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                  <Shield className="w-3.5 h-3.5" />
                  Secured by Stripe. Your payment info is encrypted.
                </div>

                <p className="text-[11px] text-slate-600 text-center">
                  By subscribing, you agree to our Terms of Service and Privacy Policy.
                  You can cancel anytime from your dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enterprise CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm mb-2">Need a custom enterprise solution?</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors"
          >
            <Crown className="w-4 h-4" /> Contact Sales <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;
