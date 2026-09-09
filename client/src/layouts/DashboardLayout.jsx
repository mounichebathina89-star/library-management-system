import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, Sparkles } from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f7f5fc] dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <nav className="border-b border-primary-100 bg-white/80 p-4 shadow-sm backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/90">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Menu size={24} />
          </button>
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600"><Sparkles size={12} /> Librarian desk</p>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Admin panel</h1>
          </div>
        </nav>

        <main className="min-w-0 flex-grow overflow-auto bg-[#f7f5fc] p-4 dark:bg-slate-950 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
