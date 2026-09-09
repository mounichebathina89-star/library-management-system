import express from 'express';
import {
  applyForBook,
  reviewApplication,
  issuePhysicalBook,
  directIssueBook,
  returnBook,
  getTransactions,
  getUserTransactions,
} from '../controllers/transactionController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protected routes - all require authentication
router.use(authMiddleware);

// User endpoints
router.post('/apply', applyForBook);
router.post('/issue', applyForBook); // backward compatibility
router.get('/my', getUserTransactions);

// Admin/Librarian endpoints
router.get('/', roleMiddleware('admin'), getTransactions);
router.post('/direct-issue', roleMiddleware('admin'), directIssueBook);
router.patch('/:id/review', roleMiddleware('admin'), reviewApplication);
router.patch('/:id/issue', roleMiddleware('admin'), issuePhysicalBook);
router.patch('/:transactionId/return', roleMiddleware('admin'), returnBook);
router.put('/:transactionId/return', roleMiddleware('admin'), returnBook); // support PUT as well

export default router;
