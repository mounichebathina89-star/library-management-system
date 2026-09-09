import express from 'express';
import {
  getAllBooks,
  getBookById,
  getBookByCode,
  addBook,
  updateBook,
  deleteBook,
  searchBooks,
} from '../controllers/bookController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/code/:code', getBookByCode);
router.get('/:id', getBookById);

// Protected routes - admin/librarian only
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  upload.single('bookFile'),
  addBook
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  upload.single('bookFile'),
  updateBook
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  deleteBook
);

export default router;
