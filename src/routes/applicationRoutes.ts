import express from 'express';
import { ApplicationController } from '../controllers/applicationController';
import { validateApplication, handleValidationErrors, validateApplicationStatus } from '../middleware/validation';
import { upload } from '../config/cloudinary';
import { submissionLimiter } from '../middleware/rateLimiter';
import { requireAdmin } from '../middleware/adminAccess';

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

// Public: anyone can submit an application. All records, changes and statistics
// below this line require an administrator credential.
router.use(requireAdmin);

// Get all applications (with pagination)
router.get(
  '/',
  ApplicationController.getApplications
);

// Get application by ID
router.get(
  '/:id',
  ApplicationController.getApplication
);

// Update application status
router.patch(
  '/:id/status',
  validateApplicationStatus,
  handleValidationErrors,
  ApplicationController.updateStatus
);

// Delete application
router.delete(
  '/:id',
  ApplicationController.deleteApplication
);

// Get application statistics
router.get(
  '/stats/overview',
  ApplicationController.getStatistics
);

export default router;