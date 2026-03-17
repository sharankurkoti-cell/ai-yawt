import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Github, Twitter, Linkedin, Mail, ArrowRight, Heart, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const footerLinks = {
    Product: [
      { label: 'YawtAI', path: '/products' },
      { label: 'AI Chat', path: '/demo?tab=chat' },
      { label: 'Debug Agent', path: '/demo?tab=debug' },
      { label: 'Project Generator', path: '/demo?tab=generator' },
      { label: 'Repo Analysis', path: '/demo?tab=repo' },
      { label: 'Download', path: '/download' },
      { label: 'Pricing', path: '/pricing' },
    ],
    Resources: [
      { label: 'Documentation', path: '/docs' },
      { label: 'API Reference', path: '/docs#api' },
      { label: 'Architecture', path: '/docs#architecture' },
      { label: 'Changelog', path: '/docs#changelog' },
      { label: 'Status', path: '/docs#status', external: true },
    ],
    Company: [
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Careers', path: '/about#careers' },
      { label: 'Blog', path: '/docs#blog' },
      { label: 'Press', path: '/about#press' },
    ],
    Legal: [
      { label: 'Privacy Policy', path: '/docs#privacy' },
      { label: 'Terms of Service', path: '/docs#terms' },
      { label: 'Cookie Policy', path: '/docs#cookies' },
      { label: 'License', path: '/docs#license' },
    ],
  };


  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/50">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 p-8 md:p-12 mb-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMi0ydi0ySDI2djJoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Stay ahead with YawtAI
              </h3>
              <p className="text-slate-300 text-sm md:text-base max-w-md">
                Get the latest updates on AI-powered development tools, new features, and engineering insights.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@email.com"
                className="flex-1 md:w-72 px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 whitespace-nowrap"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Yawt<span className="text-purple-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
              Your AI Software Engineer. Build, debug, and ship software faster with intelligent AI assistance.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Github, href: 'https://github.com/yawtllc', label: 'GitHub' },
                { icon: Twitter, href: 'https://twitter.com/yawtllc', label: 'Twitter' },
                { icon: Linkedin, href: 'https://linkedin.com/company/yawtllc', label: 'LinkedIn' },
                { icon: Mail, href: 'mailto:hello@yawtllc.com', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                    >
                      {link.label}
                      {'external' in link && link.external && <ExternalLink className="w-3 h-3" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Yawt Technologies LLC. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            Built with <Heart className="w-3.5 h-3.5 text-purple-400" /> by the Yawt Technologies team
          </p>
          <a
            href="https://yawtllc.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-purple-400 transition-colors"
          >
            yawtllc.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
