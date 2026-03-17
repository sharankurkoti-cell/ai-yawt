import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Book, Code2, Server, Database, Cpu, Layers, Terminal, FileCode,
  ChevronRight, Search, Copy, Check, ArrowRight, FolderTree,
  GitBranch, Shield, Zap, Globe
} from 'lucide-react';

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: Zap },
  { id: 'architecture', label: 'Architecture', icon: Cpu },
  { id: 'api', label: 'API Reference', icon: Server },
  { id: 'project-structure', label: 'Project Structure', icon: FolderTree },
  { id: 'deployment', label: 'Deployment', icon: Globe },
  { id: 'database', label: 'Database Schema', icon: Database },
];

const apiEndpoints = [
  {
    method: 'POST',
    path: '/ai/chat',
    desc: 'Send a message to the AI coding assistant',
    body: `{
  "messages": [
    { "role": "user", "content": "How do I create a REST API with Express?" }
  ],
  "mode": "chat",
  "context": "optional codebase context"
}`,
    response: `{
  "success": true,
  "message": "Here's how to create a REST API with Express:\\n\\n\`\`\`typescript\\nimport express from 'express';\\n...",
  "model": "google/gemini-2.5-flash",
  "mode": "chat"
}`,
  },
  {
    method: 'POST',
    path: '/ai/debug',
    desc: 'Analyze an error and get fix suggestions',
    body: `{
  "messages": [
    { "role": "user", "content": "TypeError: Cannot read property 'map' of undefined" }
  ],
  "mode": "debug",
  "context": "const users = undefined;\\nreturn users.map(u => u.name);"
}`,
    response: `{
  "success": true,
  "message": "## Bug Explanation\\nThe variable 'users' is undefined...\\n## Fixed Code\\n\`\`\`typescript\\nconst users = data?.users ?? [];\\n...",
  "mode": "debug"
}`,
  },
  {
    method: 'POST',
    path: '/ai/generate-project',
    desc: 'Generate a complete project from a prompt',
    body: `{
  "messages": [
    { "role": "user", "content": "Create a SaaS analytics dashboard with auth and REST APIs" }
  ],
  "mode": "generate-project"
}`,
    response: `{
  "success": true,
  "message": "## Project Structure\\n\`\`\`\\nanalytics-dashboard/\\n├── frontend/\\n│   ├── src/\\n...",
  "mode": "generate-project"
}`,
  },
  {
    method: 'POST',
    path: '/ai/repo-analysis',
    desc: 'Analyze a repository and answer questions',
    body: `{
  "messages": [
    { "role": "user", "content": "Explain the authentication system" }
  ],
  "mode": "repo-analysis",
  "context": "// auth.ts\\nimport jwt from 'jsonwebtoken';\\n..."
}`,
    response: `{
  "success": true,
  "message": "## Authentication System Analysis\\nThe auth system uses JWT tokens with...\\n",
  "mode": "repo-analysis"
}`,
  },
];

const projectStructure = `yawtai-platform/
├── frontend/
│   └── yawt-website/          # Next.js marketing website
│       ├── src/app/           # App Router pages
│       ├── src/components/    # React components
│       └── src/styles/        # Global styles
├── desktop/
│   └── yawtai-electron/       # Electron desktop app
│       ├── src/main/          # Main process
│       ├── src/renderer/      # React UI
│       └── src/preload/       # Preload scripts
├── backend/
│   ├── api-server/            # Express REST API
│   │   ├── src/routes/        # API routes
│   │   ├── src/controllers/   # Request handlers
│   │   ├── src/middleware/     # Auth, validation
│   │   └── src/models/        # Database models
│   ├── ai-engine/             # AI orchestration
│   │   ├── src/chat/          # Chat handler
│   │   ├── src/generation/    # Code generation
│   │   └── src/prompts/       # System prompts
│   ├── repo-analysis/         # Repository scanner
│   │   ├── src/scanner/       # File scanning
│   │   ├── src/chunker/       # Code chunking
│   │   └── src/embedder/      # Embedding generation
│   ├── debug-agent/           # Error analysis
│   │   ├── src/analyzer/      # Error parsing
│   │   ├── src/fixer/         # Fix generation
│   │   └── src/explainer/     # Explanations
│   └── project-generator/     # Project scaffolding
│       ├── src/templates/     # Project templates
│       ├── src/generator/     # Code generation
│       └── src/validator/     # Output validation
├── services/
│   ├── embeddings/            # Embedding service
│   └── vector-search/         # Qdrant integration
├── infra/
│   └── docker/                # Docker configs
│       ├── docker-compose.yml
│       ├── Dockerfile.api
│       └── nginx.conf
└── data/                      # Application data`;

const dbSchema = `-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  generated_code JSONB,
  tech_stack TEXT[],
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  mode VARCHAR(50) DEFAULT 'chat',
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repository embeddings
CREATE TABLE repo_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_url VARCHAR(500) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  chunk_index INTEGER,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, id, lang = 'bash' }: { code: string; id: string; lang?: string }) => (
    <div className="relative bg-slate-900/80 rounded-xl border border-slate-700/50 overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
        <span className="text-xs text-slate-500 font-mono">{lang}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="text-slate-500 hover:text-white transition-colors p-1"
        >
          {copiedCode === id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="bg-slate-950 text-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search docs..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              {/* Nav */}
              <nav className="space-y-1">
                {sections
                  .filter((s) => !searchQuery || s.label.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                        activeSection === s.id
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <s.icon className="w-4 h-4" />
                      {s.label}
                    </button>
                  ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {activeSection === 'getting-started' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Getting Started
                  </h1>
                  <p className="text-slate-400 leading-relaxed">
                    Get YawtAI up and running in minutes. Follow these steps to set up the complete platform locally.
                  </p>
                </div>
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Prerequisites</h2>
                  <ul className="space-y-2">
                    {['Node.js 18+', 'Docker & Docker Compose', 'PostgreSQL 15+', 'Redis 7+', 'Git'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                        <Check className="w-4 h-4 text-green-400" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Quick Start</h2>
                  <CodeBlock
                    id="clone"
                    code={`# Clone the repository
git clone https://github.com/yawtllc/yawtai-platform.git
cd yawtai-platform

# Copy environment configuration
cp .env.example .env

# Start all services with Docker
docker-compose -f infra/docker/docker-compose.yml up -d

# Access the platform
# Website:    http://localhost:3000
# API Server: http://localhost:3001
# AI Engine:  http://localhost:3002`}
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Environment Variables</h2>
                  <CodeBlock
                    id="env"
                    lang="env"
                    code={`# .env configuration
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/yawtai
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
JWT_SECRET=your_jwt_secret
NODE_ENV=development`}
                  />
                </div>
              </div>
            )}

            {activeSection === 'architecture' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Architecture
                  </h1>
                  <p className="text-slate-400 leading-relaxed">
                    YawtAI uses a microservices architecture with RAG (Retrieval Augmented Generation) at its core.
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">System Components</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: 'API Server', desc: 'Express.js gateway handling auth, routing, and request validation', icon: Server },
                      { title: 'AI Engine', desc: 'RAG-powered AI orchestration with LLM integration', icon: Cpu },
                      { title: 'Repo Analysis', desc: 'Git scanning, code chunking, and embedding generation', icon: GitBranch },
                      { title: 'Debug Agent', desc: 'Error parsing, root cause analysis, and fix generation', icon: Shield },
                      { title: 'Project Generator', desc: 'Full-stack scaffolding with templates and validation', icon: Layers },
                      { title: 'Vector Search', desc: 'Qdrant-powered semantic search over code embeddings', icon: Database },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
                        <item.icon className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold text-white">{item.title}</div>
                          <div className="text-xs text-slate-500">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Data Flow</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {['Client Request', 'API Server', 'AI Engine', 'LLM + RAG', 'Response'].map((step, i, arr) => (
                      <React.Fragment key={step}>
                        <div className="px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-800/50 text-slate-300">
                          {step}
                        </div>
                        {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-purple-400" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'api' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    API Reference
                  </h1>
                  <p className="text-slate-400 leading-relaxed">
                    Complete reference for all YawtAI API endpoints.
                  </p>
                </div>
                {apiEndpoints.map((ep) => (
                  <div key={ep.path} className="bg-slate-900/50 rounded-xl border border-slate-800/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800/50 flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                        {ep.method}
                      </span>
                      <code className="text-sm text-purple-400 font-mono">{ep.path}</code>
                      <span className="text-sm text-slate-500 ml-auto">{ep.desc}</span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Request Body</h4>
                        <CodeBlock id={`req-${ep.path}`} lang="json" code={ep.body} />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Response</h4>
                        <CodeBlock id={`res-${ep.path}`} lang="json" code={ep.response} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'project-structure' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Project Structure
                  </h1>
                  <p className="text-slate-400 leading-relaxed">
                    Complete monorepo structure for the YawtAI platform.
                  </p>
                </div>
                <CodeBlock id="structure" lang="text" code={projectStructure} />
              </div>
            )}

            {activeSection === 'deployment' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Deployment
                  </h1>
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Docker Deployment</h2>
                  <CodeBlock
                    id="docker"
                    code={`# Build and start all services
docker-compose -f infra/docker/docker-compose.yml up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Build Electron desktop app
cd desktop/yawtai-electron
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux`}
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Production Checklist</h2>
                  <ul className="space-y-2">
                    {[
                      'Set NODE_ENV=production',
                      'Configure SSL/TLS certificates',
                      'Set up database backups',
                      'Configure rate limiting',
                      'Enable monitoring and logging',
                      'Set up CI/CD pipeline',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                        <Check className="w-4 h-4 text-green-400" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'database' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Database Schema
                  </h1>
                  <p className="text-slate-400 leading-relaxed">
                    PostgreSQL database schema for the YawtAI platform.
                  </p>
                </div>
                <CodeBlock id="schema" lang="sql" code={dbSchema} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
