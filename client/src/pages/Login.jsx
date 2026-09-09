import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ShieldCheck, User, Sparkles, KeyRound } from 'lucide-react';
import Button from '../components/Button';
import PublicLayout from '../layouts/PublicLayout';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

export const Login = () => {
  const [activePortal, setActivePortal] = useState('librarian'); // 'librarian' or 'user'
  const [formData, setFormData] = useState({ email: 'admin@library.com', password: 'Admin@123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Guard: if already logged in, never show login or landing page
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Switch portals and populate appropriate defaults
  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    setError('');
    if (portal === 'librarian') {
      setFormData({ email: 'admin@library.com', password: 'Admin@123' });
    } else {
      setFormData({ email: 'john@example.com', password: 'Student@123' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      const response = await authService.login(formData.email.trim(), formData.password);

      if (response.success) {
        login(response.user, response.token);
        // Direct redirect based on role
        if (response.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="card border border-primary-100/80 p-6 shadow-2xl shadow-primary-900/10 sm:p-10">
            {/* Top Portal Switcher Tabs */}
            <div className="mb-10 flex gap-1 rounded-2xl bg-primary-50 p-1.5 dark:bg-slate-700/60">
              <button
                type="button"
                onClick={() => handlePortalSwitch('librarian')}
                className={`min-h-12 flex-1 rounded-xl px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all sm:text-sm ${
                  activePortal === 'librarian'
                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <ShieldCheck size={16} />
                Librarian Portal
              </button>

              <button
                type="button"
                onClick={() => handlePortalSwitch('user')}
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activePortal === 'user'
                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <User size={16} />
                Member Portal
              </button>
            </div>

            {/* Portal Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
                {activePortal === 'librarian' ? 'Head Librarian Sign In' : 'Member Sign In'}
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
                {activePortal === 'librarian'
                  ? 'Access the AI Analytical Dashboard and Library Circulation Operations'
                  : 'Borrow books, read e-content, and track your active loans'}
              </p>
            </div>

            {/* Fixed Librarian Badge if in Librarian mode */}
            {activePortal === 'librarian' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 flex items-start gap-3 rounded-2xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-800/50 dark:bg-primary-950/30"
              >
                <KeyRound size={18} className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-primary-900 dark:text-primary-200">
                  <span className="font-bold block">Fixed Librarian Credentials Pre-Loaded:</span>
                  <span>Email: <code>admin@library.com</code> • Password: <code>Admin@123</code></span>
                </div>
              </motion.div>
            )}

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-3 text-sm text-red-600 dark:text-red-400"
              >
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-primary-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="h-12 pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-primary-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="h-12 pl-10 text-sm"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="mt-2 min-h-12 py-3 text-sm font-bold shadow-lg shadow-primary-500/20"
              >
                {activePortal === 'librarian' ? 'Sign In as Head Librarian' : 'Sign In to Member Portal'}
              </Button>
            </form>

            {/* Member Register Link */}
            {activePortal === 'user' && (
              <div className="mt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Don't have a member account?{' '}
                <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                  Register here
                </Link>
              </div>
            )}

            {/* Quick Demo Credentials Footer */}
            <div className="mt-8 border-t border-gray-100 pt-6 dark:border-slate-700/80">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2 text-center">
                Quick 1-Click Credential Presets:
              </span>
              <div className="flex flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    handlePortalSwitch('librarian');
                    setFormData({ email: 'admin@library.com', password: 'Admin@123' });
                  }}
                  className="px-2.5 py-1 text-xs rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 hover:bg-primary-200 font-medium transition-colors"
                >
                  Admin / Librarian
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePortalSwitch('user');
                    setFormData({ email: 'john@example.com', password: 'Student@123' });
                  }}
                  className="px-2.5 py-1 text-xs rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 hover:bg-primary-200 font-medium transition-colors"
                >
                  John (Member)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePortalSwitch('user');
                    setFormData({ email: 'sarah@example.com', password: 'Reader@123' });
                  }}
                  className="px-2.5 py-1 text-xs rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 hover:bg-primary-200 font-medium transition-colors"
                >
                  Sarah (Member)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default Login;
