import React from 'react';
import Navbar from './yawtai/Navbar';
import Footer from './yawtai/Footer';
import HomePage from './yawtai/HomePage';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main>
        <HomePage />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
