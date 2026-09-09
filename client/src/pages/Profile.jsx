import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, LogOut } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, phone: user.phone });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await userService.updateUserProfile(formData);
      if (response.success) {
        updateUser(response.user);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <PublicLayout><Loading fullScreen /></PublicLayout>;
  }

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8 gradient-text">My Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-1"
            >
              <div className="card text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <User size={48} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 capitalize">
                  {user?.role}
                </p>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Email:</strong></p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all">{user?.email}</p>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-2"
            >
              <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold mb-6">Edit Profile</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email (Read-only)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="pl-10 bg-gray-100 dark:bg-slate-700 opacity-70"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      loading={saving}
                      className="flex-1"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleLogout}
                      icon={LogOut}
                    >
                      Logout
                    </Button>
                  </div>
                </form>
              </div>

              {/* Account Info */}
              <div className="card mt-6">
                <h3 className="text-lg font-bold mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-3 border-b border-gray-200 dark:border-slate-700">
                    <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                    <span className="font-semibold">{new Date(user?.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-gray-200 dark:border-slate-700">
                    <span className="text-gray-600 dark:text-gray-400">Account Status</span>
                    <span className="font-semibold text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Role</span>
                    <span className="font-semibold capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
};

export default Profile;
