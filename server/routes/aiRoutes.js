import express from 'express';
import {
  generateLibrarianAnalytics,
  librarianCopilot,
  userAssistant,
} from '../controllers/aiController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public / User AI Assistant
router.post('/user-assistant', userAssistant);

// Protected Librarian / Admin AI Intelligence endpoints
router.post(
  '/librarian-analytics',
  authMiddleware,
  roleMiddleware('admin'),
  generateLibrarianAnalytics
);

router.post(
  '/librarian-copilot',
  authMiddleware,
  roleMiddleware('admin'),
  librarianCopilot
);

export default router;
