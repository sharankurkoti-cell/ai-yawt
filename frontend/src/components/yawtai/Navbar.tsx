import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Terminal, Zap, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  {
    label: 'Products',
    path: '/products',
    children: [
      { label: 'YawtAI', path: '/products' },
      { label: 'AI Chat', path: '/demo?tab=chat' },
      { label: 'Debug Agent', path: '/demo?tab=debug' },
      { label: 'Project Generator', path: '/demo?tab=generator' },
      { label: 'Repo Analysis', path: '/demo?tab=repo' },
    ],
  },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Blog', path: '/blog' },
  { label: 'Download', path: '/download' },
  { label: 'Docs', path: '/docs' },
  { label: 'Contact', path: '/contact' },
];


/* ─── Auth Modal ─── */
const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !password) { setError('Email and password are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setBusy(true);
    const res = mode === 'login' ? await signIn(email, password) : await signUp(email, password, name);
    setBusy(false);
    if (res.error) {
      setError(res.error);
    } else if (mode === 'signup') {
      setSuccess('Account created! Check your email to confirm, or sign in now.');
      setMode('login');
    }
  };

  return (
    <div ref={backdropRef} onClick={(e) => e.target === backdropRef.current && onClose()} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
              <img src="/yawt-logo.png" alt="YawtAI" className="w-5 h-5 object-contain" />
            </div>
            <span className="font-bold text-white">Yawt<span className="text-purple-400">AI</span></span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800/50">
          {(['login', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-all ${mode === m ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5' : 'text-slate-500 hover:text-slate-300'}`}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300">{error}</div>}
          {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-300">{success}</div>}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
          </div>
          <button type="submit" disabled={busy}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
            {busy ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          <p className="text-xs text-slate-500 text-center">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-purple-400 hover:text-purple-300 font-medium">{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
          </p>
        </form>
      </div>
    </div>
  );
};

/* ─── Navbar ─── */
const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, showAuthModal, setShowAuthModal, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); setDropdownOpen(null); setUserMenuOpen(false); }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl shadow-purple-900/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow overflow-hidden">
                  <img src="/yawt-logo.png" alt="YawtAI" className="w-6 h-6 object-contain" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-950 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Yawt<span className="text-purple-400">AI</span></span>
                <span className="hidden sm:block text-[10px] text-slate-500 -mt-1 tracking-wider uppercase">by Yawt Technologies</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.label} className="relative" onMouseEnter={() => link.children && setDropdownOpen(link.label)} onMouseLeave={() => setDropdownOpen(null)}>
                  <Link to={link.path} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${location.pathname === link.path ? 'text-purple-400 bg-purple-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                    {link.label}
                    {link.children && <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen === link.label ? 'rotate-180' : ''}`} />}
                  </Link>
                  {link.children && dropdownOpen === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl shadow-purple-900/20 p-2">
                      {link.children.map((child) => (
                        <Link key={child.label} to={child.path} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-purple-500/10 transition-all">
                          <Zap className="w-3.5 h-3.5 text-purple-400" />{child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA / User */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/demo" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-all hover:bg-white/5">Try Demo</Link>
              {user ? (
                <div ref={userMenuRef} className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">{initials}</div>
                    <span className="text-sm text-slate-300 max-w-[100px] truncate">{user.name || user.email}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl p-2">
                      <div className="px-3 py-2 border-b border-slate-800/50 mb-1">
                        <div className="text-sm font-medium text-white truncate">{user.name || 'User'}</div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                        <User className="w-4 h-4" /> Dashboard
                      </Link>
                      <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5">
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Toggle */}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <React.Fragment key={link.label}>
                  <Link to={link.path} className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${location.pathname === link.path ? 'text-purple-400 bg-purple-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>{link.label}</Link>
                  {link.children?.map((child) => (
                    <Link key={child.label} to={child.path} className="block px-8 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">{child.label}</Link>
                  ))}
                </React.Fragment>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">{initials}</div>
                      <div><div className="text-sm text-white">{user.name}</div><div className="text-xs text-slate-500">{user.email}</div></div>
                    </div>
                    <button onClick={signOut} className="w-full text-center px-4 py-3 text-sm font-medium text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-all">Sign Out</button>
                  </>
                ) : (
                  <button onClick={() => { setShowAuthModal(true); setIsOpen(false); }} className="w-full text-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg transition-all">Sign In</button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default Navbar;
