import React from 'react';
import Navbar from './yawtai/Navbar';
import Footer from './yawtai/Footer';
import HomePage from './yawtai/HomePage';
import AuthModal from './yawtai/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

const AppLayout: React.FC = () => {
  const { showAuthModal, setShowAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main>
        <HomePage />
      </main>
      <Footer />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default AppLayout;
