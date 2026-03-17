import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Monitor, Laptop, Terminal, Check, ArrowRight, Shield,
  Zap, HardDrive, Cpu, ChevronDown, ChevronRight, Globe, FileCode
} from 'lucide-react';
import { supabase } from '@/lib/supabase';


const platforms = [
  {
    id: 'windows',
    name: 'Windows',
    icon: Monitor,
    version: 'v1.0.0-beta',
    size: '89 MB',
    filename: 'YawtAI-Setup-1.0.0.exe',
    requirements: ['Windows 10 or later', '64-bit processor', '4 GB RAM minimum', '500 MB disk space'],
    instructions: [
      'Download the .exe installer',
      'Run YawtAI-Setup-1.0.0.exe',
      'Follow the installation wizard',
      'Launch YawtAI from Start Menu',
    ],
  },
  {
    id: 'macos',
    name: 'macOS',
    icon: Laptop,

    version: 'v1.0.0-beta',
    size: '92 MB',
    filename: 'YawtAI-1.0.0.dmg',
    requirements: ['macOS 12 (Monterey) or later', 'Apple Silicon or Intel', '4 GB RAM minimum', '500 MB disk space'],
    instructions: [
      'Download the .dmg file',
      'Open the disk image',
      'Drag YawtAI to Applications',
      'Launch from Applications folder',
    ],
  },
  {
    id: 'linux',
    name: 'Linux',
    icon: Terminal,
    version: 'v1.0.0-beta',
    size: '86 MB',
    filename: 'yawtai-1.0.0.AppImage',
    requirements: ['Ubuntu 20.04+ / Fedora 36+ / Arch', '64-bit processor', '4 GB RAM minimum', '500 MB disk space'],
    instructions: [
      'Download the .AppImage file',
      'Make it executable: chmod +x yawtai-*.AppImage',
      'Run: ./yawtai-1.0.0.AppImage',
      'Or install via snap: snap install yawtai',
    ],
  },
];

const features = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Native performance with Electron' },
  { icon: Shield, title: 'Secure', desc: 'Your code never leaves your machine' },
  { icon: Globe, title: 'Cross-Platform', desc: 'Windows, macOS, and Linux' },
  { icon: FileCode, title: 'Full IDE', desc: 'Chat, debug, generate, explore' },
];

const DownloadPage: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState('windows');
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (platformId: string) => {
    setDownloading(platformId);
    try {
      await supabase.from('yawtai_downloads').insert({
        platform: platformId,
        version: '1.0.0-beta',
        user_agent: navigator.userAgent,
      });
    } catch (e) {
      // silent
    }
    setTimeout(() => {
      setDownloading(null);
      alert(`Thank you! YawtAI Desktop for ${platformId} download would start now. (Beta - coming soon)`);
    }, 1500);
  };

  const platform = platforms.find((p) => p.id === activePlatform)!;

  return (
    <div className="bg-slate-950 text-white pt-24">
      {/* Hero */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-6">
            <Download className="w-3.5 h-3.5" />
            Free Download — Public Beta
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Download YawtAI
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Desktop
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Get the full power of AI-assisted development on your desktop. Available for Windows, macOS, and Linux.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-800/50">
                <f.icon className="w-4 h-4 text-purple-400" />
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">{f.title}</div>
                  <div className="text-[10px] text-slate-500">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Selector */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Platform Tabs */}
          <div className="flex justify-center gap-3 mb-10">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  activePlatform === p.id
                    ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-900/50 border border-slate-800/50 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <p.icon className="w-5 h-5" />
                {p.name}
              </button>
            ))}
          </div>

          {/* Download Card */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <platform.icon className="w-8 h-8 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white">YawtAI for {platform.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{platform.version}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>{platform.size}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>{platform.filename}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(platform.id)}
                  disabled={downloading === platform.id}
                  className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {downloading === platform.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download for {platform.name}
                    </>
                  )}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Requirements */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-slate-400" />
                    System Requirements
                  </h4>
                  <ul className="space-y-2.5">
                    {platform.requirements.map((req) => (
                      <li key={req} className="flex items-center gap-2 text-sm text-slate-400">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Installation */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-slate-400" />
                    Installation Steps
                  </h4>
                  <ol className="space-y-2.5">
                    {platform.instructions.map((step, i) => (
                      <li key={step} className="flex items-start gap-3 text-sm text-slate-400">
                        <span className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs text-purple-400 flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Desktop App Preview
            </h2>
          </div>
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl" />
            <img
              src="https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500753091_d1b13d74.jpg"
              alt="YawtAI Desktop"
              className="relative rounded-2xl border border-slate-700/50 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 mb-6">
            Prefer the web version? Try YawtAI directly in your browser.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-white/5 transition-all"
          >
            Open Web Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DownloadPage;
