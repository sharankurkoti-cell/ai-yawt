import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquare, Bug, Layers, FolderGit2, Send, Loader2, Terminal,
  Code2, Copy, Check, Trash2, Sparkles, ChevronRight, Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Mode = 'chat' | 'debug' | 'generator' | 'repo';
type Message = { role: 'user' | 'assistant'; content: string };

const tabs: { id: Mode; label: string; icon: React.ElementType; desc: string; placeholder: string }[] = [
  { id: 'chat', label: 'AI Chat', icon: MessageSquare, desc: 'Ask coding questions', placeholder: 'Ask me anything about code... e.g., "How do I implement JWT authentication in Express?"' },
  { id: 'debug', label: 'Debug Agent', icon: Bug, desc: 'Analyze errors', placeholder: 'Paste your error stack trace or describe the bug...' },
  { id: 'generator', label: 'Project Generator', icon: Layers, desc: 'Generate projects', placeholder: 'Describe the project you want to build... e.g., "Create a SaaS analytics dashboard with authentication and REST APIs"' },
  { id: 'repo', label: 'Repo Analysis', icon: FolderGit2, desc: 'Analyze codebases', placeholder: 'Paste code or describe what you want to analyze...' },
];

const examplePrompts: Record<Mode, string[]> = {
  chat: ['How do I create a REST API with Express and TypeScript?', 'Explain React hooks and when to use useEffect vs useMemo', 'What are the best practices for PostgreSQL query optimization?'],
  debug: ['TypeError: Cannot read property \'map\' of undefined\n\nconst users = fetchUsers();\nreturn users.map(u => u.name);', 'Error: ECONNREFUSED 127.0.0.1:5432'],
  generator: ['Build a fintech dashboard using React, Node.js and PostgreSQL', 'Create a SaaS analytics dashboard with authentication and REST APIs'],
  repo: ['Explain the authentication system in this codebase', 'Find potential security vulnerabilities', 'Suggest performance improvements'],
};

/* ─── Auth Gate ─── */
const AuthGate: React.FC = () => {
  const { setShowAuthModal } = useAuth();
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Sign in to use YawtAI</h2>
      <p className="text-slate-400 max-w-md mb-8">Create a free account to access AI code generation, debugging, project scaffolding, and repository analysis.</p>
      <button onClick={() => setShowAuthModal(true)} className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-xl shadow-purple-500/25 flex items-center gap-2">
        Sign In to Continue
      </button>
    </div>
  );
};

/* ─── Demo Page ─── */
const DemoPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Mode>((searchParams.get('tab') as Mode) || 'chat');
  const [messages, setMessages] = useState<Record<Mode, Message[]>>({ chat: [], debug: [], generator: [], repo: [] });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();


  // Load chat history from DB on mount
  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      const { data } = await supabase
        .from('yawtai_chat_history')
        .select('*')
        .eq('session_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(4);
      if (data && data.length > 0) {
        const loaded: Record<Mode, Message[]> = { chat: [], debug: [], generator: [], repo: [] };
        data.forEach((row: any) => {
          if (row.mode && loaded[row.mode as Mode] !== undefined) {
            loaded[row.mode as Mode] = row.messages || [];
          }
        });
        setMessages(loaded);
      }
    };
    loadHistory();
  }, [user]);

  // Save chat history to DB when messages change
  useEffect(() => {
    if (!user) return;
    const saveHistory = async (mode: Mode) => {
      if (messages[mode].length === 0) return;
      const { data: existing } = await supabase
        .from('yawtai_chat_history')
        .select('id')
        .eq('session_id', user.id)
        .eq('mode', mode)
        .limit(1);
      if (existing && existing.length > 0) {
        await supabase.from('yawtai_chat_history').update({ messages: messages[mode], updated_at: new Date().toISOString() }).eq('id', existing[0].id);
      } else {
        await supabase.from('yawtai_chat_history').insert({ session_id: user.id, mode, messages: messages[mode] });
      }
    };
    const timeout = setTimeout(() => saveHistory(activeTab), 1000);
    return () => clearTimeout(timeout);
  }, [messages, activeTab, user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeTab]);
  useEffect(() => { const tab = searchParams.get('tab') as Mode; if (tab && ['chat', 'debug', 'generator', 'repo'].includes(tab)) setActiveTab(tab); }, [searchParams]);

  const modeMap: Record<Mode, string> = { chat: 'chat', debug: 'debug', generator: 'generate-project', repo: 'repo-analysis' };

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;
    const userMsg: Message = { role: 'user', content };
    const newMessages = [...messages[activeTab], userMsg];
    setMessages((prev) => ({ ...prev, [activeTab]: newMessages }));
    setInput('');
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('yawtai-chat', {
        body: { messages: [{ role: 'user', content }], mode: modeMap[activeTab], context: activeTab === 'debug' ? content : undefined },
      });
      if (error) throw error;
      const assistantMsg: Message = { role: 'assistant', content: data?.message || 'Sorry, I could not generate a response.' };
      setMessages((prev) => ({ ...prev, [activeTab]: [...newMessages, assistantMsg] }));
    } catch (err: any) {
      setMessages((prev) => ({ ...prev, [activeTab]: [...newMessages, { role: 'assistant', content: `Error: ${err.message || 'Failed to get response.'}` }] }));
    }
    setLoading(false);
  };

  const clearChat = () => setMessages((prev) => ({ ...prev, [activeTab]: [] }));
  const copyMessage = (content: string, idx: number) => { navigator.clipboard.writeText(content); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2000); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const currentTab = tabs.find((t) => t.id === activeTab)!;
  const currentMessages = messages[activeTab];

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const lang = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={i} className="my-3 bg-slate-800/80 rounded-lg border border-slate-700/50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-700/30 border-b border-slate-700/50">
              <span className="text-xs text-slate-500 font-mono">{lang || 'code'}</span>
              <button onClick={() => copyMessage(code, i + 1000)} className="text-slate-500 hover:text-white transition-colors p-0.5">
                {copiedIdx === i + 1000 ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-slate-300 overflow-x-auto"><code>{code}</code></pre>
          </div>
        );
      }
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i}>
          {boldParts.map((bp, j) => {
            if (bp.startsWith('**') && bp.endsWith('**')) return <strong key={j} className="text-white font-semibold">{bp.slice(2, -2)}</strong>;
            const codeParts = bp.split(/(`.*?`)/g);
            return codeParts.map((cp, k) => {
              if (cp.startsWith('`') && cp.endsWith('`')) return <code key={k} className="px-1.5 py-0.5 bg-slate-800 rounded text-purple-300 text-xs font-mono">{cp.slice(1, -1)}</code>;
              return <span key={k}>{cp}</span>;
            });
          })}
        </span>
      );
    });
  };

  // If not authenticated, show auth gate
  if (!user) {
    return (
      <div className="bg-slate-950 text-white pt-20 min-h-screen flex flex-col">
        <AuthGate />
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-white pt-20 min-h-screen flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">YawtAI Developer Studio</h1>
            <p className="text-sm text-slate-500">Welcome back, {user.name || user.email}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchParams({ tab: tab.id }); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === tab.id ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  <tab.icon className="w-5 h-5" />
                  <div><div>{tab.label}</div><div className="text-[10px] text-slate-500">{tab.desc}</div></div>
                  {messages[tab.id].length > 0 && <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-500">{messages[tab.id].length}</span>}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Example Prompts</h3>
              <div className="space-y-1.5">
                {examplePrompts[activeTab].map((prompt, i) => (
                  <button key={i} onClick={() => sendMessage(prompt)} className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all line-clamp-2 border border-transparent hover:border-slate-800">
                    <ChevronRight className="w-3 h-3 inline mr-1 text-purple-400" />{prompt.slice(0, 80)}{prompt.length > 80 ? '...' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/30 rounded-2xl border border-slate-800/50 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/50 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <currentTab.icon className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">{currentTab.label}</span>
              </div>
              {currentMessages.length > 0 && (
                <button onClick={clearChat} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10" title="Clear chat">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {currentMessages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{currentTab.label}</h3>
                  <p className="text-sm text-slate-500 max-w-md mb-6">
                    {activeTab === 'chat' && 'Ask any coding question and get expert AI assistance.'}
                    {activeTab === 'debug' && 'Paste your error stack trace to get instant analysis and fixes.'}
                    {activeTab === 'generator' && 'Describe a project and get complete full-stack code generated.'}
                    {activeTab === 'repo' && 'Paste code or describe what you want to analyze.'}
                  </p>
                </div>
              )}

              {currentMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Terminal className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-purple-600/20 border border-purple-500/20 text-slate-200' : 'bg-slate-800/50 border border-slate-700/50 text-slate-300'}`}>
                    <div className="whitespace-pre-wrap">{renderContent(msg.content)}</div>
                    {msg.role === 'assistant' && (
                      <div className="mt-2 pt-2 border-t border-slate-700/30 flex items-center gap-2">
                        <button onClick={() => copyMessage(msg.content, i)} className="text-slate-500 hover:text-white transition-colors p-1">
                          {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                      {user.name?.slice(0, 1).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Terminal className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> YawtAI is thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
              <div className="flex gap-3">
                <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}

                  placeholder={currentTab.placeholder} rows={2}
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none" />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-end">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-2 text-center">YawtAI can make mistakes. Verify important code before deploying.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
