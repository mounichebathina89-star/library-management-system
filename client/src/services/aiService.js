import api from './api';

export const aiService = {
  getLibrarianAnalytics: async () => {
    return api.post('/ai/librarian-analytics');
  },

  askLibrarianCopilot: async (query, history = []) => {
    return api.post('/ai/librarian-copilot', { query, history });
  },

  askUserAssistant: async (message, history = []) => {
    return api.post('/ai/user-assistant', { message, history });
  },
};

export default aiService;
