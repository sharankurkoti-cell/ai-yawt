import React, { useState } from 'react';
import {
  Mail, MapPin, Phone, Send, Globe, Github, Twitter, Linkedin,
  MessageSquare, Building2, Clock, Check, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@yawtllc.com', href: 'mailto:hello@yawtllc.com' },
  { icon: Globe, label: 'Website', value: 'yawtllc.com', href: 'https://yawtllc.com' },
  { icon: Github, label: 'GitHub', value: 'github.com/yawtllc', href: 'https://github.com/yawtllc' },
  { icon: Clock, label: 'Response Time', value: 'Within 24 hours', href: null },
];

const topics = [
  'General Inquiry',
  'Technical Support',
  'Partnership',
  'Enterprise Licensing',
  'Bug Report',
  'Feature Request',
  'Press & Media',
  'Careers',
];

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', type: 'General Inquiry' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');
    try {
      const { error } = await supabase.from('yawtai_feedback').insert({
        name: form.name,
        email: form.email,
        subject: form.subject || form.type,
        message: form.message,
        type: form.type,
      });
      if (error) throw error;
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '', type: 'General Inquiry' });
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <div className="bg-slate-950 text-white pt-24">
      {/* Hero */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
              <MessageSquare className="w-3.5 h-3.5" />
              Get in Touch
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-lg text-slate-400">
              Have questions about YawtAI? Want to partner with us? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Yawt Technologies</h2>
                <div className="space-y-4">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">{item.label}</div>
                        {item.href ? (
                          <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-purple-400 transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-300">{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { icon: Github, href: 'https://github.com/yawtllc' },
                    { icon: Twitter, href: 'https://twitter.com/yawtllc' },
                    { icon: Linkedin, href: 'https://linkedin.com/company/yawtllc' },
                  ].map(({ icon: Icon, href }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-slate-900/50 border border-slate-800/50 flex items-center justify-center text-slate-400 hover:text-purple-400 hover:border-purple-500/30 transition-all"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Send us a message</h2>

                {status === 'sent' && (
                  <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-green-300">Message sent successfully! We'll get back to you soon.</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-red-300">Something went wrong. Please try again.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${errors.name ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors`}
                        placeholder="Your name"
                      />
                      {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={`w-full px-4 py-3 bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors`}
                        placeholder="you@email.com"
                      />
                      {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Topic</label>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        {topics.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Brief subject"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Message *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={6}
                      className={`w-full px-4 py-3 bg-slate-800/50 border ${errors.message ? 'border-red-500' : 'border-slate-700'} rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none`}
                      placeholder="Tell us how we can help..."
                    />
                    {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {status === 'sending' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
