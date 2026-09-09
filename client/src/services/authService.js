import api from './api';

export const authService = {
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  getMe: async () => {
    return api.get('/auth/me');
  },
};

export default authService;
