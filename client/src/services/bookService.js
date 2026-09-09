import api from './api';

export const bookService = {
  getAllBooks: async (params = {}) => {
    return api.get('/books', { params });
  },

  getBookById: async (id) => {
    return api.get(`/books/${id}`);
  },

  getBookByCode: async (code) => {
    return api.get(`/books/code/${code}`);
  },

  addBook: async (bookData) => {
    const isFormData = bookData instanceof FormData;
    return api.post('/books', bookData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  updateBook: async (id, bookData) => {
    const isFormData = bookData instanceof FormData;
    return api.put(`/books/${id}`, bookData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  deleteBook: async (id) => {
    return api.delete(`/books/${id}`);
  },

  searchBooks: async (params = {}) => {
    return api.get('/books/search', { params });
  },
};

export default bookService;
