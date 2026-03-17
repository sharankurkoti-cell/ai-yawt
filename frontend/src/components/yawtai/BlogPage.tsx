import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, User, ArrowRight, Tag, ChevronRight,
  BookOpen, Sparkles, Code2, Cpu, Shield, Layers
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: 'ai-code-generation-2026',
    title: 'The Future of AI Code Generation in 2026',
    excerpt: 'Explore how AI-powered code generation is transforming software development, from intelligent autocomplete to full-stack project scaffolding.',
    content: `AI code generation has evolved dramatically over the past few years. What started as simple autocomplete suggestions has grown into sophisticated systems capable of understanding complex requirements and generating production-ready code.

At YawtAI, we've been at the forefront of this revolution, building tools that understand not just syntax, but architecture, design patterns, and best practices. Our RAG-powered engine analyzes your codebase context to generate solutions that fit seamlessly into your existing projects.

Key trends we're seeing in 2026:
- Context-aware code generation that understands your entire codebase
- Multi-file generation with consistent patterns and types
- Automated testing alongside generated code
- Integration with CI/CD pipelines for instant deployment

The future is bright for developers who embrace AI as a coding partner rather than a replacement.`,
    author: 'YawtAI Team',
    date: '2026-03-15',
    readTime: '5 min read',
    category: 'AI & Development',
    tags: ['AI', 'Code Generation', 'Future of Dev'],
    image: 'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500788669_dc618bda.png',
    featured: true,
  },
  {
    id: 'debugging-with-ai',
    title: 'How AI Debugging Saves Hours of Developer Time',
    excerpt: 'Learn how AI-powered debugging tools can analyze stack traces, identify root causes, and suggest fixes in seconds instead of hours.',
    content: `Every developer knows the frustration of spending hours tracking down a bug, only to find it was a simple typo or missing null check. AI debugging tools are changing this experience dramatically.

YawtAI's Debug Agent uses advanced pattern recognition to analyze stack traces, error messages, and code context. It can identify common pitfalls, suggest fixes, and even explain why the error occurred in plain language.

Here's how AI debugging typically works:
1. Paste your error or stack trace
2. The AI analyzes the error pattern and context
3. It identifies the most likely root cause
4. You receive a clear explanation and suggested fix
5. Apply the fix with confidence

Our users report saving an average of 2-3 hours per debugging session when using AI-assisted debugging.`,
    author: 'YawtAI Team',
    date: '2026-03-10',
    readTime: '4 min read',
    category: 'Developer Tools',
    tags: ['Debugging', 'Productivity', 'AI Tools'],
    image: 'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500776559_e17a0371.jpg',
  },
  {
    id: 'rag-architecture-explained',
    title: 'Understanding RAG Architecture for Code Intelligence',
    excerpt: 'A deep dive into Retrieval-Augmented Generation (RAG) and how it powers more accurate and context-aware AI coding assistants.',
    content: `Retrieval-Augmented Generation (RAG) is the backbone of modern AI coding assistants. Unlike traditional language models that rely solely on training data, RAG systems can retrieve and reference specific code patterns, documentation, and best practices in real-time.

YawtAI's RAG architecture works in three stages:
1. Indexing: Your codebase is analyzed and indexed for quick retrieval
2. Retrieval: When you ask a question, relevant code snippets and patterns are retrieved
3. Generation: The AI generates responses augmented with this retrieved context

This approach produces significantly more accurate and relevant code suggestions compared to generic AI models. The generated code follows your project's conventions, uses your existing libraries, and maintains consistency with your codebase.

Benefits of RAG for code intelligence:
- Higher accuracy in code suggestions
- Better understanding of project-specific patterns
- Reduced hallucinations in AI responses
- More relevant documentation references`,
    author: 'YawtAI Team',
    date: '2026-03-05',
    readTime: '7 min read',
    category: 'Engineering',
    tags: ['RAG', 'Architecture', 'AI Engineering'],
    image: 'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500779964_0d8d6652.png',
  },
  {
    id: 'full-stack-project-generation',
    title: 'From Prompt to Production: Full-Stack Project Generation',
    excerpt: 'See how YawtAI generates complete full-stack projects with frontend, backend, database schemas, and deployment configs from a single prompt.',
    content: `Imagine describing your project idea in a few sentences and getting a complete, production-ready codebase. That's what YawtAI's Project Generator delivers.

When you describe a project like "Build a SaaS analytics dashboard with authentication, REST APIs, and real-time data visualization," our AI:

1. Analyzes your requirements and identifies the optimal tech stack
2. Generates the frontend with React, TypeScript, and Tailwind CSS
3. Creates the backend API with Express.js and proper routing
4. Designs the database schema with PostgreSQL migrations
5. Sets up Docker configuration for easy deployment
6. Includes comprehensive documentation and README

Each generated project follows industry best practices and is immediately runnable. No boilerplate setup, no configuration headaches — just your project, ready to customize and deploy.`,
    author: 'YawtAI Team',
    date: '2026-02-28',
    readTime: '6 min read',
    category: 'Product Updates',
    tags: ['Project Generation', 'Full-Stack', 'Automation'],
    image: 'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500810894_dce8ecc2.png',
  },
  {
    id: 'secure-coding-with-ai',
    title: 'Building More Secure Applications with AI-Assisted Development',
    excerpt: 'Discover how AI tools can help identify security vulnerabilities, suggest hardening measures, and enforce secure coding practices.',
    content: `Security is often an afterthought in software development, but AI tools are changing this by making security analysis a natural part of the coding workflow.

YawtAI's Security Analysis feature scans your code for common vulnerabilities including:
- SQL injection risks
- Cross-site scripting (XSS) vulnerabilities
- Authentication and authorization issues
- Insecure data handling practices
- Dependency vulnerabilities

Beyond just identifying issues, our AI explains why each vulnerability matters and provides specific, actionable fixes. This educational approach helps developers build more secure applications over time, not just fix immediate issues.

Best practices for AI-assisted security:
- Run security analysis on every PR
- Review AI-suggested fixes before applying them
- Use AI to generate security tests
- Keep dependencies updated based on AI recommendations`,
    author: 'YawtAI Team',
    date: '2026-02-20',
    readTime: '5 min read',
    category: 'Security',
    tags: ['Security', 'Best Practices', 'Code Review'],
    image: 'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500809560_9d188c1f.png',
  },
  {
    id: 'yawtai-desktop-launch',
    title: 'Introducing YawtAI Desktop: AI Development on Your Machine',
    excerpt: 'YawtAI Desktop brings the full power of AI-assisted development to your local environment with an Electron-based cross-platform application.',
    content: `We're excited to announce the launch of YawtAI Desktop — a cross-platform desktop application that brings all of YawtAI's AI capabilities directly to your local development environment.

Built with Electron, YawtAI Desktop provides:
- AI Chat Panel for conversational coding assistance
- Project Generator for full-stack scaffolding
- Debug Console for intelligent error analysis
- File Explorer for navigating and understanding codebases
- Code Viewer with syntax highlighting and AI annotations

YawtAI Desktop works alongside your favorite IDE, whether it's VS Code, JetBrains, or any other editor. It analyzes your local projects and provides context-aware assistance without requiring you to copy and paste code into a web browser.

Available for Windows, macOS, and Linux — download it today from our Downloads page.`,
    author: 'YawtAI Team',
    date: '2026-02-15',
    readTime: '4 min read',
    category: 'Product Updates',
    tags: ['Desktop App', 'Launch', 'Cross-Platform'],
    image: 'https://d64gsuwffb70l.cloudfront.net/69b578ca08d60056f2bc258d_1773500753091_d1b13d74.jpg',
  },
];

const categories = ['All', 'AI & Development', 'Developer Tools', 'Engineering', 'Product Updates', 'Security'];

const categoryIcons: Record<string, React.ElementType> = {
  'AI & Development': Cpu,
  'Developer Tools': Code2,
  'Engineering': Layers,
  'Product Updates': Sparkles,
  'Security': Shield,
};

const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter((post) => post.category === selectedCategory);

  const featuredPost = blogPosts.find((post) => post.featured);

  if (selectedPost) {
    return (
      <div className="bg-slate-950 text-white pt-24 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-400 transition-colors mb-8"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Blog
          </button>

          <article>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                  {selectedPost.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(selectedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {selectedPost.readTime}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent leading-tight">
                {selectedPost.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <User className="w-4 h-4" />
                <span>{selectedPost.author}</span>
              </div>
            </div>

            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-64 sm:h-80 object-cover rounded-2xl border border-slate-800/50 mb-8"
            />

            <div className="prose prose-invert prose-slate max-w-none">
              {selectedPost.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-slate-300 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/50">
              <div className="flex flex-wrap gap-2">
                {selectedPost.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-white pt-24 min-h-screen">
      {/* Hero */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            YawtAI Blog
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Engineering Insights &
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Development
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Stay up to date with the latest in AI-powered development, engineering best practices, and YawtAI product updates.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {selectedCategory === 'All' && featuredPost && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSelectedPost(featuredPost)}
              className="w-full group relative bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden hover:border-purple-500/30 transition-all text-left"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-purple-500/90 text-white text-xs font-bold">
                    Featured
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium w-fit mb-4">
                    {featuredPost.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-400 mb-4 line-clamp-3">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredPost.readTime}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm text-purple-400 group-hover:text-purple-300">
                    Read more <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.filter(p => selectedCategory !== 'All' || !p.featured).map((post) => {
              const CategoryIcon = categoryIcons[post.category] || BookOpen;
              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden hover:border-slate-700 hover:-translate-y-1 transition-all text-left"
                >
                  <div className="relative h-48">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-xs text-slate-300 flex items-center gap-1">
                      <CategoryIcon className="w-3 h-3 text-purple-400" /> {post.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Never miss an update
              </h2>
              <p className="text-slate-300 max-w-lg mx-auto mb-6">
                Subscribe to our newsletter and get the latest articles, tutorials, and product updates delivered to your inbox.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Subscribe Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
