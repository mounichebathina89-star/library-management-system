import api from './api';

export const userService = {
  getUserProfile: async () => {
    return api.get('/user/profile');
  },

  updateUserProfile: async (userData) => {
    return api.put('/user/profile', userData);
  },

  getAllUsers: async () => {
    return api.get('/user');
  },

  updateUserStatus: async (userId, isActive) => {
    return api.put(`/user/${userId}/status`, { isActive });
  },

  getDashboardStats: async () => {
    return api.get('/dashboard/stats');
  },
};

export default userService;
