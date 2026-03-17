import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Shield, CreditCard, MessageSquare, Bug, Layers, FolderGit2,
  Settings, ChevronRight, Zap, Clock, BarChart3, ArrowRight, Crown,
  Activity, TrendingUp, Calendar, Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, setShowAuthModal, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'usage' | 'subscription' | 'settings'>('overview');

  if (!user) {
    return (
      <div className="bg-slate-950 text-white pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign in to access your Dashboard</h2>
          <p className="text-slate-400 mb-8">View your usage stats, manage your subscription, and customize your YawtAI experience.</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 mx-auto"
          >
            <Mail className="w-5 h-5" />
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : user.email?.slice(0, 2).toUpperCase() || '??';

  const usageStats = [
    { label: 'AI Messages', used: 12, limit: 50, icon: MessageSquare, color: 'purple' },
    { label: 'Debug Analyses', used: 3, limit: 10, icon: Bug, color: 'red' },
    { label: 'Projects Generated', used: 1, limit: 3, icon: Layers, color: 'blue' },
    { label: 'Repo Analyses', used: 0, limit: 1, icon: FolderGit2, color: 'green' },
  ];

  const recentActivity = [
    { type: 'chat', title: 'Asked about React hooks optimization', time: '2 hours ago', icon: MessageSquare },
    { type: 'debug', title: 'Debugged TypeError in user service', time: '5 hours ago', icon: Bug },
    { type: 'project', title: 'Generated SaaS dashboard project', time: '1 day ago', icon: Layers },
    { type: 'chat', title: 'Discussed PostgreSQL indexing strategies', time: '2 days ago', icon: MessageSquare },
    { type: 'repo', title: 'Analyzed authentication module', time: '3 days ago', icon: FolderGit2 },
  ];

  const quickActions = [
    { label: 'AI Chat', desc: 'Start a coding conversation', icon: MessageSquare, link: '/demo?tab=chat', color: 'from-purple-500 to-purple-600' },
    { label: 'Debug Code', desc: 'Analyze an error', icon: Bug, link: '/demo?tab=debug', color: 'from-red-500 to-red-600' },
    { label: 'Generate Project', desc: 'Scaffold a new project', icon: Layers, link: '/demo?tab=generator', color: 'from-blue-500 to-blue-600' },
    { label: 'Analyze Repo', desc: 'Understand a codebase', icon: FolderGit2, link: '/demo?tab=repo', color: 'from-emerald-500 to-emerald-600' },
  ];

  const sidebarItems = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'usage' as const, label: 'Usage & Limits', icon: Activity },
    { id: 'subscription' as const, label: 'Subscription', icon: CreditCard },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-slate-950 text-white pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-purple-500/25">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Welcome back, {user.name || 'Developer'}
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> {user.email}
                {user.email_verified && (
                  <span className="flex items-center gap-1 text-green-400 text-xs">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="px-4 py-2 text-sm font-medium text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/10 transition-all flex items-center gap-2">
              <Crown className="w-4 h-4" /> Upgrade Plan
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    activeSection === item.id
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Plan Badge */}
            <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-white">Free Plan</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">50 messages/day, 3 projects/month</p>
              <Link to="/pricing" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                Upgrade <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Quick Actions */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                      <Link
                        key={action.label}
                        to={action.link}
                        className="group bg-slate-900/50 rounded-xl border border-slate-800/50 p-4 hover:border-slate-700 hover:-translate-y-0.5 transition-all"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{action.label}</h3>
                        <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Usage Overview */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Today's Usage</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {usageStats.map((stat) => {
                      const percentage = stat.limit > 0 ? (stat.used / stat.limit) * 100 : 0;
                      return (
                        <div key={stat.label} className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <stat.icon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-300">{stat.label}</span>
                            </div>
                            <span className="text-sm font-mono text-slate-400">
                              {stat.used}/{stat.limit}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-amber-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                  <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 divide-y divide-slate-800/50">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center flex-shrink-0">
                          <activity.icon className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-300 truncate">{activity.title}</p>
                        </div>
                        <span className="text-xs text-slate-600 flex-shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'usage' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Usage & Limits</h2>
                  <p className="text-sm text-slate-400">Track your daily and monthly usage across all YawtAI features.</p>
                </div>

                <div className="grid gap-4">
                  {usageStats.map((stat) => {
                    const percentage = stat.limit > 0 ? (stat.used / stat.limit) * 100 : 0;
                    return (
                      <div key={stat.label} className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center">
                              <stat.icon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">{stat.label}</h3>
                              <p className="text-xs text-slate-500">Resets daily</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-white">{stat.used}</span>
                            <span className="text-slate-500 text-sm"> / {stat.limit}</span>
                          </div>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-amber-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{Math.round(percentage)}% used</p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-semibold text-white">Need more?</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Upgrade to Pro for unlimited AI messages, more project generations, and priority response speeds.</p>
                  <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-medium">
                    View Plans <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {activeSection === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Subscription</h2>
                  <p className="text-sm text-slate-400">Manage your YawtAI subscription and billing.</p>
                </div>

                <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Free Plan</h3>
                        <p className="text-sm text-slate-400">Current plan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">$0</div>
                      <div className="text-xs text-slate-500">per month</div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Star className="w-4 h-4 text-purple-400" /> 50 AI messages/day
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Star className="w-4 h-4 text-purple-400" /> 10 debug analyses/day
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Star className="w-4 h-4 text-purple-400" /> 3 projects/month
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Star className="w-4 h-4 text-purple-400" /> Community support
                    </div>
                  </div>

                  <Link
                    to="/pricing"
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25"
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade to Pro
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" /> Billing History
                  </h3>
                  <p className="text-sm text-slate-500">No billing history available on the Free plan.</p>
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Settings</h2>
                  <p className="text-sm text-slate-400">Manage your account settings and preferences.</p>
                </div>

                <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Name</label>
                      <div className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm">
                        {user.name || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                      <div className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm flex items-center justify-between">
                        <span>{user.email}</span>
                        {user.email_verified && (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Account Actions</h3>
                  <button
                    onClick={signOut}
                    className="px-4 py-2 text-sm font-medium text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
