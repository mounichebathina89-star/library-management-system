import api from './api';

export const transactionService = {
  applyForBook: async (data) => {
    return api.post('/transactions/apply', data);
  },

  issueBook: async (bookId) => {
    return api.post('/transactions/issue', { bookId });
  },

  reviewApplication: async (id, data) => {
    return api.patch(`/transactions/${id}/review`, data);
  },

  issuePhysicalBook: async (id, data) => {
    return api.patch(`/transactions/${id}/issue`, data);
  },

  directIssueBook: async (data) => {
    return api.post('/transactions/direct-issue', data);
  },

  returnBook: async (transactionId) => {
    return api.patch(`/transactions/${transactionId}/return`);
  },

  getTransactions: async (params = {}) => {
    return api.get('/transactions', { params });
  },

  getUserTransactions: async (params = {}) => {
    return api.get('/transactions/my', { params });
  },

  getOverdueBooks: async (params = {}) => {
    return api.get('/transactions/overdue', { params });
  },
};

export default transactionService;
