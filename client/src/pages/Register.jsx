import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import PublicLayout from '../layouts/PublicLayout';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
      });

      if (response.success) {
        login(response.user, response.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="card border border-primary-100/80 p-6 shadow-2xl shadow-primary-900/10 sm:p-10">
            <div className="mb-9 text-center">
              <p className="section-kicker">Your reading life, organized</p>
              <h1 className="mt-3 text-4xl font-black text-[#302653] dark:text-white">Join LibraryHub</h1>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">Create your member account and make the collection yours.</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3"
              >
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-primary-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-primary-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 text-primary-400" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="h-12 pl-10"
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
                    placeholder="Create a password"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-primary-400" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="mt-7 min-h-12"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-8 flex gap-3 rounded-2xl border border-primary-100 bg-primary-50 p-4">
              <CheckCircle className="flex-shrink-0 text-primary-600" size={20} />
              <p className="text-xs leading-5 text-primary-900 dark:text-primary-300">
                Account registration is limited to regular users. Admins must be created by existing administrators.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default Register;
