import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { ScrollToTop } from '../common/ScrollToTop';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#242424] font-sans antialiased">
      {/* Scroll restoration helper */}
      <ScrollToTop />

      {/* Main reusable navigation bar */}
      <Navbar />

      {/* Main page content routed through React Router */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Main reusable footer */}
      <Footer />

      {/* Reusable floating WhatsApp trigger button */}
      <WhatsAppButton />
    </div>
  );
};
