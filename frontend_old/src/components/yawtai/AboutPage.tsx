import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Target, Lightbulb, Rocket, Globe, Shield, Code2, Cpu,
  ArrowRight, Building2, Award, Heart, Zap, GitBranch
} from 'lucide-react';

const values = [
  { icon: Lightbulb, title: 'Innovation First', desc: 'We push the boundaries of what AI can do for developers, constantly exploring new architectures and approaches.' },
  { icon: Users, title: 'Developer-Centric', desc: 'Every feature is designed with real developer workflows in mind. We build tools we want to use ourselves.' },
  { icon: Shield, title: 'Privacy & Security', desc: 'Your code stays yours. We prioritize data privacy and security in every aspect of our platform.' },
  { icon: Heart, title: 'Open Community', desc: 'We believe in the power of open source and community-driven development to create better tools.' },
];

const techStack = [
  { name: 'React / Next.js', category: 'Frontend', color: 'text-cyan-400' },
  { name: 'TypeScript', category: 'Language', color: 'text-blue-400' },
  { name: 'Node.js / Express', category: 'Backend', color: 'text-green-400' },
  { name: 'PostgreSQL', category: 'Database', color: 'text-blue-300' },
  { name: 'Redis', category: 'Cache', color: 'text-red-400' },
  { name: 'Qdrant', category: 'Vector DB', color: 'text-purple-400' },
  { name: 'Electron', category: 'Desktop', color: 'text-cyan-300' },
  { name: 'Docker', category: 'Infrastructure', color: 'text-blue-400' },
  { name: 'TailwindCSS', category: 'Styling', color: 'text-cyan-400' },
  { name: 'RAG Architecture', category: 'AI', color: 'text-purple-400' },
  { name: 'OpenAI / Gemini', category: 'LLM', color: 'text-emerald-400' },
  { name: 'ShadCN UI', category: 'Components', color: 'text-slate-300' },
];

const milestones = [
  { year: '2024', title: 'Yawt Technologies Founded', desc: 'Started with a vision to democratize AI-powered development tools.' },
  { year: '2025', title: 'YawtAI Alpha Release', desc: 'Launched the first version of our AI coding assistant to early adopters.' },
  { year: '2025', title: 'RAG Engine v2', desc: 'Introduced advanced retrieval-augmented generation for codebase understanding.' },
  { year: '2026', title: 'Public Beta Launch', desc: 'YawtAI Desktop and web platform available to all developers worldwide.' },
];

const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-white pt-24">
      {/* Hero */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
              <Building2 className="w-3.5 h-3.5" />
              About Yawt Technologies
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Building the future of
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI-powered development
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Yawt Technologies is a software company dedicated to creating intelligent developer tools. Our flagship product, YawtAI, is an AI-powered development assistant that helps engineers build, debug, and ship software faster.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
                <Target className="w-3.5 h-3.5" />
                Our Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Empowering developers with intelligent AI tools
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                We believe that the next generation of software will be built by developers working alongside AI. Our mission is to create the most intelligent, context-aware development assistant that understands your codebase, anticipates your needs, and generates production-ready solutions.
              </p>
              <p className="text-slate-400 leading-relaxed">
                YawtAI is not just another code completion tool — it's a comprehensive AI software engineer that can analyze repositories, debug complex issues, generate full-stack projects, and provide architectural guidance.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl" />
              <img
                src="https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500788669_dc618bda.png"
                alt="AI Technology"
                className="relative rounded-2xl border border-slate-700/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Our Core Values
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The principles that guide everything we build at Yawt Technologies.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6 hover:border-purple-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <v.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
              <Code2 className="w-3.5 h-3.5" />
              Technology Stack
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Built with modern technologies
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {techStack.map((tech) => (
              <div key={tech.name} className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 hover:border-slate-700 transition-all group">
                <div className={`text-sm font-semibold ${tech.color} mb-1`}>{tech.name}</div>
                <div className="text-xs text-slate-500">{tech.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Our Journey
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-8">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-sm font-bold text-purple-400">
                    {m.year.slice(2)}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="w-px flex-1 bg-gradient-to-b from-purple-500/30 to-transparent mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="text-xs text-purple-400 font-medium mb-1">{m.year}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{m.title}</h3>
                  <p className="text-sm text-slate-400">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Join us in shaping the future
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Whether you're a developer, contributor, or partner — we'd love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              Get in Touch <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://yawtllc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Visit yawtllc.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
