import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Moon, Sun, LogOut, User, ShieldCheck, Laptop, Library, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Button from './Button';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
    setIsOpen(false);
  };

  const homePath = isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/';

  return (
    <nav className="sticky top-0 z-30 border-b border-primary-100/70 bg-white/75 shadow-[0_8px_30px_rgba(73,55,125,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between">
          {/* Logo */}
          <Link to={homePath} className="group flex items-center gap-3 text-xl font-black gradient-text">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-xl shadow-sm ring-1 ring-primary-100 transition-transform group-hover:-rotate-6 dark:bg-primary-950/60 dark:ring-primary-900">📚</span>
            <span className="tracking-tight">LibraryHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/books"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-primary-400"
            >
              <BookOpen size={16} />
              Catalog & E-Reader
            </Link>

            {!isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Portal Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            ) : (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-primary-400"
                >
                  {isAdmin ? (
                    <>
                      <ShieldCheck size={16} className="text-amber-500" />
                      Librarian Control
                    </>
                  ) : (
                    <>
                      <Library size={16} className="text-primary-500" />
                      My Dashboard
                    </>
                  )}
                </Link>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAdmin ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <Link to="/profile" className="hover:underline flex items-center gap-1 text-gray-800 dark:text-gray-200">
                    <User size={14} />
                    {user?.name}
                  </Link>
                  <span className="text-[10px] text-gray-400 font-mono">
                    ({user?.role})
                  </span>
                </div>

                <Button variant="secondary" size="sm" onClick={handleLogout} icon={LogOut} aria-label="Sign out of LibraryHub">
                  Sign Out
                </Button>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 pt-2 border-t border-gray-100 dark:border-slate-800 space-y-3"
          >
            <Link
              to="/books"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200"
            >
              Catalog & E-Reader
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  {isAdmin ? 'Librarian Command Center' : 'My Dashboard'}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Profile ({user?.name})
                </Link>
                <div className="pt-2">
                  <Button fullWidth variant="secondary" size="sm" onClick={handleLogout} icon={LogOut}>
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button fullWidth variant="outline" size="sm" onClick={() => { navigate('/login'); setIsOpen(false); }}>
                  Portal Login
                </Button>
                <Button fullWidth size="sm" onClick={() => { navigate('/register'); setIsOpen(false); }}>
                  Register Account
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
