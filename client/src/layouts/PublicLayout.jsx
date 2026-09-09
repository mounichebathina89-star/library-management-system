import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-transparent dark:bg-slate-950 text-gray-900 dark:text-white">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
