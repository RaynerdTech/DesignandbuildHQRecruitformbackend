import express from 'express';
import { ApplicationController } from '../controllers/applicationController';
import { validateApplication, handleValidationErrors, validateApplicationStatus } from '../middleware/validation';
import { upload } from '../config/cloudinary';
import { submissionLimiter, apiLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Submit new application (with rate limiting)
router.post(
  '/submit',
  submissionLimiter,
  upload.single('cv'),
  validateApplication,
  handleValidationErrors,
  ApplicationController.submitApplication
);

// Get all applications (with pagination)
router.get(
  '/',
  apiLimiter,
  ApplicationController.getApplications
);

// Get application by ID
router.get(
  '/:id',
  apiLimiter,
  ApplicationController.getApplication
);

// Update application status
router.patch(
  '/:id/status',
  apiLimiter,
  validateApplicationStatus,
  handleValidationErrors,
  ApplicationController.updateStatus
);

// Delete application
router.delete(
  '/:id',
  apiLimiter,
  ApplicationController.deleteApplication
);

// Get application statistics
router.get(
  '/stats/overview',
  apiLimiter,
  ApplicationController.getStatistics
);

export default router;