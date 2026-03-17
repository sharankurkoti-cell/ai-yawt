import React from 'react';
import Navbar from '@/components/yawtai/Navbar';
import Footer from '@/components/yawtai/Footer';
import StripeCheckout from '@/components/yawtai/StripeCheckout';
import { AppProvider } from '@/contexts/AppContext';

const CheckoutPageRoute: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main>
          <StripeCheckout />
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
};

export default CheckoutPageRoute;
