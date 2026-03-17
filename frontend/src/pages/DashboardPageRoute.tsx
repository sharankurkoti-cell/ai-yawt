import React from 'react';
import Navbar from '@/components/yawtai/Navbar';
import Footer from '@/components/yawtai/Footer';
import DashboardPage from '@/components/yawtai/DashboardPage';
import { AppProvider } from '@/contexts/AppContext';

const DashboardPageRoute: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main>
          <DashboardPage />
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
};

export default DashboardPageRoute;
