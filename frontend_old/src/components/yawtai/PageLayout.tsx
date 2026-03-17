import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default PageLayout;
