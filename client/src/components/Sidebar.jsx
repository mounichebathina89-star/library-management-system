import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Users, History, LogOut, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'AI Analytics & Stats', path: '/admin' },
    { icon: BookOpen, label: 'Book Inventory', path: '/admin/books' },
    { icon: History, label: 'Physical Intake & Loans', path: '/admin/transactions' },
    { icon: LayoutDashboard, label: 'Borrow Requests', path: '/admin/requests' },
    { icon: Users, label: 'Member Directory', path: '/admin/users' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        exit={{ x: -300 }}
        className="fixed left-0 top-0 h-screen w-[min(18rem,calc(100vw-1rem))] overflow-y-auto border-r border-white/10 bg-[#302653] p-5 text-white shadow-2xl shadow-primary-900/20 z-40 md:relative md:z-0 md:translate-x-0 md:!transform-none"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500/15 text-xl ring-1 ring-primary-400/20">📚</span>
            <div>
              <span className="block">LibraryHub</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Librarian desk</span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-2">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-400 text-white shadow-lg shadow-primary-950/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 border-t border-white/10 pt-6">
          <button
            onClick={() => {
              logout();
              onClose();
              navigate('/', { replace: true });
            }}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
