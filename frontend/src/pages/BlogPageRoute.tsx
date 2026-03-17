import React from 'react';
import Navbar from '@/components/yawtai/Navbar';
import Footer from '@/components/yawtai/Footer';
import BlogPage from '@/components/yawtai/BlogPage';
import { AppProvider } from '@/contexts/AppContext';

const BlogPageRoute: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main>
          <BlogPage />
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
};

export default BlogPageRoute;
