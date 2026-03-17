import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, Zap, Building2, Rocket, Crown, ArrowRight, Shield,
  MessageSquare, Code2, Bug, Layers, FolderGit2, Users, Cpu,
  HelpCircle, ChevronDown, ChevronUp, Sparkles, Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type BillingCycle = 'monthly' | 'annual';

const plans = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    desc: 'Perfect for getting started with AI-assisted development.',
    monthlyPrice: 0,
    annualPrice: 0,
    popular: false,
    cta: 'Get Started Free',
    ctaLink: '/demo',
    gradient: 'from-slate-500 to-slate-600',
    features: [
      { text: '50 AI chat messages / day', included: true },
      { text: '10 debug analyses / day', included: true },
      { text: '3 project generations / month', included: true },
      { text: '1 repository analysis / month', included: true },
      { text: 'Community support', included: true },
      { text: 'Basic code generation', included: true },
      { text: 'Priority responses', included: false },
      { text: 'Custom templates', included: false },
      { text: 'Team collaboration', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Rocket,
    desc: 'For professional developers who need unlimited AI power.',
    monthlyPrice: 29,
    annualPrice: 24,
    popular: true,
    cta: 'Start Pro Trial',
    ctaLink: '/demo',
    gradient: 'from-purple-500 to-blue-500',
    features: [
      { text: 'Unlimited AI chat messages', included: true },
      { text: 'Unlimited debug analyses', included: true },
      { text: '50 project generations / month', included: true },
      { text: '20 repository analyses / month', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Advanced code generation', included: true },
      { text: 'Priority responses (2x faster)', included: true },
      { text: 'Custom templates', included: true },
      { text: 'Team collaboration', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    icon: Users,
    desc: 'For development teams that want to build faster together.',
    monthlyPrice: 79,
    annualPrice: 65,
    popular: false,
    cta: 'Start Team Trial',
    ctaLink: '/demo',
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited project generations', included: true },
      { text: 'Unlimited repository analyses', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Advanced code generation', included: true },
      { text: 'Priority responses (3x faster)', included: true },
      { text: 'Custom templates & sharing', included: true },
      { text: 'Team collaboration (up to 10)', included: true },
      { text: 'API access (10K req/month)', included: true },
      { text: 'SSO & admin dashboard', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    desc: 'Custom solutions for large organizations with advanced needs.',
    monthlyPrice: -1,
    annualPrice: -1,
    popular: false,
    cta: 'Contact Sales',
    ctaLink: '/contact',
    gradient: 'from-amber-500 to-orange-500',
    features: [
      { text: 'Everything in Team', included: true },
      { text: 'Unlimited everything', included: true },
      { text: 'Self-hosted deployment option', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom AI model fine-tuning', included: true },
      { text: 'Priority responses (fastest)', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Unlimited API access', included: true },
      { text: 'SSO, SAML & admin dashboard', included: true },
    ],
  },
];

const faqs = [
  {
    q: 'Can I try YawtAI before purchasing?',
    a: 'Yes! Our Free tier gives you access to all core features with daily limits. You can also start a 14-day free trial of any paid plan — no credit card required.',
  },
  {
    q: 'What happens when I exceed my plan limits?',
    a: 'When you reach your daily or monthly limits, you\'ll receive a notification. You can upgrade your plan at any time, or wait for the next cycle. We never charge overage fees.',
  },
  {
    q: 'Can I switch plans at any time?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be prorated for the remainder of your billing cycle. Downgrades take effect at the next billing date.',
  },
  {
    q: 'Is my code secure with YawtAI?',
    a: 'Yes. We use end-to-end encryption for all data in transit and at rest. Your code is never stored permanently on our servers — it\'s only processed in memory during your session. We are SOC 2 Type II compliant.',
  },
  {
    q: 'Do you offer educational or open-source discounts?',
    a: 'Yes! We offer 50% off Pro plans for students and educators, and free Team plans for qualifying open-source projects. Contact us at hello@yawtllc.com with your details.',
  },
  {
    q: 'What AI models power YawtAI?',
    a: 'YawtAI uses a combination of state-of-the-art language models including GPT-4, Gemini 2.5 Flash, and our proprietary RAG (Retrieval Augmented Generation) engine for code-specific tasks.',
  },
];

const comparisons = [
  { feature: 'AI Chat Messages', free: '50/day', pro: 'Unlimited', team: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Debug Analyses', free: '10/day', pro: 'Unlimited', team: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Project Generations', free: '3/month', pro: '50/month', team: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Repo Analyses', free: '1/month', pro: '20/month', team: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Response Speed', free: 'Standard', pro: '2x Faster', team: '3x Faster', enterprise: 'Fastest' },
  { feature: 'Custom Templates', free: '-', pro: 'Yes', team: 'Yes + Sharing', enterprise: 'Yes + Custom' },
  { feature: 'Team Members', free: '1', pro: '1', team: 'Up to 10', enterprise: 'Unlimited' },
  { feature: 'API Access', free: '-', pro: '-', team: '10K req/mo', enterprise: 'Unlimited' },
  { feature: 'Support', free: 'Community', pro: 'Email', team: 'Dedicated', enterprise: 'Account Manager' },
  { feature: 'Self-Hosted', free: '-', pro: '-', team: '-', enterprise: 'Yes' },
];

const PricingPage: React.FC = () => {
  const [billing, setBilling] = useState<BillingCycle>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user, setShowAuthModal } = useAuth();

  const handleCta = (plan: typeof plans[0]) => {
    if (plan.ctaLink === '/contact') return; // Link handles navigation
    if (!user) {
      setShowAuthModal(true);
    }
    // If user is logged in, Link handles navigation to /demo
  };

  return (
    <div className="bg-slate-950 text-white pt-24">
      {/* Hero */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Choose the plan that
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              fits your workflow
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Start free and scale as you grow. All plans include access to our core AI features.
            No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-slate-900/50 rounded-xl border border-slate-800/50 p-1.5">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billing === 'annual'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
              const isCustom = price === -1;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-slate-900/50 rounded-2xl border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl ${
                    plan.popular
                      ? 'border-purple-500/40 shadow-lg shadow-purple-500/10'
                      : 'border-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
                  )}
                  <div className="p-6">
                    {plan.popular && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                        Most Popular
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                        <plan.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 min-h-[40px]">{plan.desc}</p>

                    {/* Price */}
                    <div className="mb-6">
                      {isCustom ? (
                        <div className="text-3xl font-bold text-white">Custom</div>
                      ) : price === 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">$0</span>
                          <span className="text-slate-500 text-sm">/month</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">${price}</span>
                          <span className="text-slate-500 text-sm">
                            /month{billing === 'annual' ? ' (billed annually)' : ''}
                          </span>
                        </div>
                      )}
                      {billing === 'annual' && !isCustom && price > 0 && (
                        <div className="text-xs text-green-400 mt-1">
                          Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/year
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <Link
                      to={plan.ctaLink}
                      onClick={() => handleCta(plan)}
                      className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25'
                          : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-white/5 hover:text-white hover:border-slate-500'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {/* Features */}
                    <div className="mt-6 pt-6 border-t border-slate-800/50 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature.text} className="flex items-start gap-2.5">
                          {feature.included ? (
                            <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <X className="w-3 h-3 text-slate-600" />
                            </div>
                          )}
                          <span className={`text-sm ${feature.included ? 'text-slate-300' : 'text-slate-600'}`}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Detailed Comparison
            </h2>
            <p className="text-slate-400">See exactly what's included in each plan.</p>
          </div>

          <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-slate-800/30 border-b border-slate-800/50">
              <div className="text-sm font-semibold text-slate-400">Feature</div>
              <div className="text-sm font-semibold text-slate-300 text-center">Free</div>
              <div className="text-sm font-semibold text-purple-400 text-center">Pro</div>
              <div className="text-sm font-semibold text-blue-400 text-center">Team</div>
              <div className="text-sm font-semibold text-amber-400 text-center">Enterprise</div>
            </div>
            {/* Table Rows */}
            {comparisons.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-5 gap-4 px-6 py-3.5 ${
                  i % 2 === 0 ? 'bg-slate-900/30' : ''
                } ${i < comparisons.length - 1 ? 'border-b border-slate-800/30' : ''}`}
              >
                <div className="text-sm text-slate-300">{row.feature}</div>
                <div className="text-sm text-slate-400 text-center">{row.free}</div>
                <div className="text-sm text-slate-300 text-center">{row.pro}</div>
                <div className="text-sm text-slate-300 text-center">{row.team}</div>
                <div className="text-sm text-slate-300 text-center">{row.enterprise}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'SOC 2 Compliant', desc: 'Enterprise-grade security' },
              { icon: Globe, title: '99.9% Uptime', desc: 'Reliable infrastructure' },
              { icon: Cpu, title: 'GDPR Ready', desc: 'Data privacy first' },
              { icon: Users, title: '10K+ Developers', desc: 'Trusted by teams worldwide' },
            ].map((badge) => (
              <div key={badge.title} className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <badge.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{badge.title}</div>
                  <div className="text-xs text-slate-500">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Ready to supercharge your development?
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">
                Join 10,000+ developers building faster with YawtAI. Start free, upgrade when you're ready.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/demo"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-xl shadow-purple-500/25 flex items-center gap-2 text-lg"
                >
                  Start Building Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-4 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-white/5 transition-all flex items-center gap-2 text-lg"
                >
                  <Building2 className="w-5 h-5" />
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
