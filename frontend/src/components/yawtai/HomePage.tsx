import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Code2, Bug, FolderGit2, Layers, MessageSquare, Sparkles,
  Terminal, Zap, Shield, Globe, Cpu, ChevronRight, Play, Download,
  GitBranch, Database, FileCode, Rocket
} from 'lucide-react';

const HERO_IMG = 'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500724714_53b75a6a.jpg';
const DESKTOP_IMG = 'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500753091_d1b13d74.jpg';
const FEATURE_IMGS = [
  'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500788669_dc618bda.png',
  'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500776559_e17a0371.jpg',
  'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500779964_0d8d6652.png',
];
const CARD_IMGS = [
  'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500810894_dce8ecc2.png',
  'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500809560_9d188c1f.png',
  'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500810730_e5a3f553.png',
  'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500813393_0ceb0144.jpg',
];

const features = [
  { icon: Code2, title: 'AI Code Generation', desc: 'Generate production-ready code from natural language prompts. Full-stack support for React, Node.js, Python, and more.', color: 'purple' },
  { icon: Bug, title: 'AI Debugging', desc: 'Paste your stack trace and get instant bug explanations, fixed code, and improved implementations.', color: 'red' },
  { icon: FolderGit2, title: 'Codebase Understanding', desc: 'Connect your GitHub repo and ask questions about architecture, patterns, and potential improvements.', color: 'blue' },
  { icon: Layers, title: 'Project Generator', desc: 'Generate complete projects with frontend, backend, database schema, Docker setup, and documentation.', color: 'green' },
  { icon: MessageSquare, title: 'AI Coding Chat', desc: 'Have natural conversations about code. Get explanations, refactoring suggestions, and best practices.', color: 'cyan' },
  { icon: Shield, title: 'Security Analysis', desc: 'Identify vulnerabilities, security anti-patterns, and get recommendations for hardening your codebase.', color: 'amber' },
];

const colorMap: Record<string, string> = {
  purple: 'from-purple-500 to-purple-600 shadow-purple-500/25 bg-purple-500/10 text-purple-400 border-purple-500/20',
  red: 'from-red-500 to-red-600 shadow-red-500/25 bg-red-500/10 text-red-400 border-red-500/20',
  blue: 'from-blue-500 to-blue-600 shadow-blue-500/25 bg-blue-500/10 text-blue-400 border-blue-500/20',
  green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25 bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/25 bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/25 bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const steps = [
  { num: '01', icon: Terminal, title: 'Describe Your Intent', desc: 'Tell YawtAI what you want to build, debug, or analyze using natural language.' },
  { num: '02', icon: Cpu, title: 'AI Processes & Generates', desc: 'Our RAG-powered AI engine analyzes context, retrieves relevant patterns, and generates solutions.' },
  { num: '03', icon: Rocket, title: 'Ship with Confidence', desc: 'Get production-ready code, comprehensive documentation, and deployment configurations.' },
];

const stats = [
  { value: '10x', label: 'Faster Development' },
  { value: '50+', label: 'Languages Supported' },
  { value: '99.2%', label: 'Code Accuracy' },
  { value: '24/7', label: 'AI Availability' },
];

const HomePage: React.FC = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Build a fintech dashboard with React, Node.js and PostgreSQL';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Now in Public Beta — Free to use
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6">
                <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                  YawtAI —
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Your AI Software
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Engineer
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-lg mb-8 leading-relaxed">
                YawtAI helps developers build, debug, and ship software faster using AI. From code generation to full project scaffolding — all powered by advanced RAG architecture.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  to="/demo"
                  className="group px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Try YawtAI Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/download"
                  className="px-6 py-3.5 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-white/5 hover:border-slate-500 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Desktop App
                </Link>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl" />
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-slate-500 ml-2 font-mono">yawtai-terminal</span>
                </div>
                {/* Terminal Body */}
                <div className="p-6 font-mono text-sm space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400">$</span>
                    <span className="text-slate-300">yawtai generate</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400">?</span>
                    <span className="text-slate-400">
                      {typedText}
                      <span className="animate-pulse text-purple-400">|</span>
                    </span>
                  </div>
                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="text-emerald-400 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" /> Generating frontend... React + TypeScript
                    </div>
                    <div className="text-blue-400 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" /> Creating database schema... PostgreSQL
                    </div>
                    <div className="text-purple-400 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5" /> Setting up API routes... Express.js
                    </div>
                    <div className="text-cyan-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Building Docker config... docker-compose
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/50">
                    <span className="text-green-400">✓</span>
                    <span className="text-slate-300 ml-2">Project generated successfully!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
              <Zap className="w-3.5 h-3.5" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Everything you need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                build faster with AI
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              YawtAI combines cutting-edge AI with deep developer tooling to supercharge your workflow.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const colors = colorMap[feature.color];
              const colorParts = colors.split(' ');
              return (
                <Link
                  key={feature.title}
                  to="/demo"
                  className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6 hover:border-slate-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`w-12 h-12 rounded-xl ${colorParts[3]} border ${colorParts[5]} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${colorParts[4]}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Try it now <ChevronRight className="w-4 h-4" />
                  </div>
                  {i < 3 && (
                    <img
                      src={FEATURE_IMGS[i]}
                      alt=""
                      className="absolute top-0 right-0 w-24 h-24 object-cover rounded-tr-2xl rounded-bl-2xl opacity-0 group-hover:opacity-10 transition-opacity"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              <Globe className="w-3.5 h-3.5" />
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Three simple steps to
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                AI-powered development
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-purple-500/30 to-transparent -translate-x-1/2" />
                )}
                <div className="bg-slate-900/30 rounded-2xl border border-slate-800/50 p-8 text-center hover:border-purple-500/30 transition-all group">
                  <div className="text-5xl font-bold text-slate-800 mb-4 group-hover:text-purple-900/50 transition-colors">
                    {step.num}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Start free, scale as
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                you grow
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              No credit card required. Upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Free', price: '$0', desc: '50 messages/day, 3 projects/month', gradient: 'from-slate-500 to-slate-600' },
              { name: 'Pro', price: '$24', desc: 'Unlimited messages, 50 projects/month', gradient: 'from-purple-500 to-blue-500', popular: true },
              { name: 'Team', price: '$65', desc: 'Everything unlimited, team collaboration', gradient: 'from-blue-500 to-cyan-500' },
            ].map((plan) => (
              <Link
                key={plan.name}
                to="/pricing"
                className={`relative bg-slate-900/50 rounded-2xl border p-6 text-center hover:-translate-y-1 transition-all group ${
                  plan.popular
                    ? 'border-purple-500/40 shadow-lg shadow-purple-500/10'
                    : 'border-slate-800/50 hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-2xl" />
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold text-white mb-2">
                  {plan.price}<span className="text-sm text-slate-500 font-normal">/mo</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{plan.desc}</p>
                <div className="text-sm text-purple-400 group-hover:text-purple-300 flex items-center justify-center gap-1">
                  View details <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Compare all plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Desktop App Preview */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
                <Terminal className="w-3.5 h-3.5" />
                Desktop Application
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  The complete developer
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  desktop experience
                </span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                YawtAI Desktop brings the full power of AI-assisted development to your local environment. Built with Electron for cross-platform support.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'AI Chat Panel — Conversational coding assistance',
                  'Project Generator — Full-stack scaffolding from prompts',
                  'Debug Console — Intelligent error analysis',
                  'File Explorer — Navigate and understand codebases',
                  'Code Viewer — Syntax-highlighted with AI annotations',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChevronRight className="w-3 h-3 text-purple-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/download"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25"
              >
                <Download className="w-4 h-4" />
                Download for Free
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl" />
              <img
                src={DESKTOP_IMG}
                alt="YawtAI Desktop Application"
                className="relative rounded-2xl border border-slate-700/50 shadow-2xl shadow-purple-900/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Vision */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 p-12 md:p-16">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  Our Vision
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-6">
                At Yawt Technologies, we believe AI should amplify human creativity, not replace it. YawtAI is designed to be the intelligent partner every developer deserves — understanding context, generating solutions, and learning from your codebase to deliver increasingly personalized assistance.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                We're building the future of software engineering where developers focus on architecture, design, and innovation while YawtAI handles the implementation details. Our RAG-powered architecture ensures every suggestion is contextually relevant and production-ready.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Learn more about our mission <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Ready to code with AI?
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Join thousands of developers who are building faster with YawtAI. Free to start, powerful enough for production.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/demo"
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 flex items-center gap-2 text-lg"
            >
              <Play className="w-5 h-5" />
              Try YawtAI Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/download"
              className="px-8 py-4 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-white/5 hover:border-slate-500 transition-all flex items-center gap-2 text-lg"
            >
              <Download className="w-5 h-5" />
              Download Desktop
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
