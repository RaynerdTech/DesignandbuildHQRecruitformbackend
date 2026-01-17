import { Request, Response, NextFunction } from 'express';
import { validationResult, body, ValidationChain } from 'express-validator';
import Application from '../models/Application';

export const validateApplication: ValidationChain[] = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ max: 100 }).withMessage('Full name cannot exceed 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  
  // Primary role validation - custom role required when "Other" is selected
  body('primaryRole')
    .trim()
    .notEmpty().withMessage('Primary role is required')
    .isIn([
      'UI/UX Designer',
      'Front-End Developer',
      'Back-End Developer',
      'Full-Stack Developer',
      'Mobile App Developer (Flutter)',
      'Mobile App Developer (React Native)',
      'Mobile App Developer (iOS)',
      'Mobile App Developer (Android)',
      'DevOps Engineer',
      'SEO Specialist',
      'Product Manager',
      'Digital Marketer',
      'Content Writer',
      'Data Analyst',
      'Data Scientist',
      'QA / Test Engineer',
      'Game Developer',
      'Blockchain Developer',
      'Other'
    ]).withMessage('Invalid primary role selected'),
  
  // Custom role is required when primaryRole is "Other"
  body('customRole')
    .custom((value, { req }) => {
      // If primaryRole is "Other", customRole is required
      if (req.body.primaryRole === 'Other') {
        if (!value || value.trim().length === 0) {
          throw new Error('Custom role is required when selecting "Other"');
        }
        if (value.trim().length > 100) {
          throw new Error('Custom role cannot exceed 100 characters');
        }
      }
      return true;
    }),
  
  body('experience')
    .notEmpty().withMessage('Experience is required')
    .isIn(['0–1', '1–3', '3–5', '5+']).withMessage('Invalid experience range'),
  
  body('skills')
    .custom((value) => {
      if (!value) return false;
      
      // Handle both stringified JSON and array
      let skills: string[];
      if (typeof value === 'string') {
        try {
          skills = JSON.parse(value);
        } catch {
          return false;
        }
      } else if (Array.isArray(value)) {
        skills = value;
      } else {
        return false;
      }
      
      return Array.isArray(skills) && 
             skills.length > 0 && 
             skills.every(skill => typeof skill === 'string' && skill.trim().length > 0);
    }).withMessage('At least one valid skill is required'),
  
  body('portfolioLinks')
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional, so empty is OK
      
      let links: string[];
      if (typeof value === 'string') {
        try {
          links = JSON.parse(value);
        } catch {
          return false;
        }
      } else if (Array.isArray(value)) {
        links = value;
      } else {
        return false;
      }
      
      if (!Array.isArray(links)) return false;
      
      return links.every(link => {
        try {
          new URL(link);
          return true;
        } catch {
          return false;
        }
      });
    }).withMessage('All portfolio links must be valid URLs'),
  
  // Availability - if "Other" is selected, custom availability should be allowed
  body('availability')
    .notEmpty().withMessage('Availability is required')
    .isIn(['Immediate', '2 weeks', '1 month', 'Other'])
    .withMessage('Invalid availability option'),
  
  body('availabilityOther')
    .optional()
    .custom((value, { req }) => {
      // If availability is "Other", custom availability detail is required
      if (req.body.availability === 'Other') {
        if (!value || value.trim().length === 0) {
          throw new Error('Please specify your availability when selecting "Other"');
        }
      }
      return true;
    }),
  
  body('ukHours')
    .notEmpty().withMessage('UK hours preference is required')
    .isIn(['Yes', 'Partially', 'No']).withMessage('Invalid UK hours option'),
  
  body('officeWork')
    .notEmpty().withMessage('Office work preference is required')
    .isIn(['Yes', 'No', 'Hybrid']).withMessage('Invalid office work option'),
  
  body('salaryRange')
    .notEmpty().withMessage('Salary range is required')
    .isIn(['Below ₦400,000', '₦400,000 – ₦600,000', '₦600,000 – ₦900,000', '₦900,000 – ₦1,500,000', '₦1,500,000+'])
    .withMessage('Invalid salary range'),
  
  body('summary')
  .optional({ checkFalsy: true }) // Skips validation if empty, null, or undefined
  .trim()
  .isLength({ min: 50, max: 2000 })
  .withMessage('Summary must be between 50 and 2000 characters if you choose to provide one'),
  
  body('ukClients')
    .notEmpty().withMessage('UK clients experience is required')
    .isIn(['Yes', 'No']).withMessage('Invalid UK clients option'),
  
  body('ukClientsDetails')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('UK clients details cannot exceed 1000 characters'),
  
  body('interest')
    .trim()
    .notEmpty().withMessage('Interest statement is required')
    .isLength({ min: 50, max: 1000 }).withMessage('Interest statement must be between 50 and 1000 characters'),
  
  body('accuracyConsent')
    .custom((value) => {
      // Handle string "true" from FormData
      const boolValue = value === 'true' || value === true;
      return boolValue === true;
    }).withMessage('Accuracy consent must be accepted'),
  
  body('dataConsent')
    .custom((value) => {
      // Handle string "true" from FormData
      const boolValue = value === 'true' || value === true;
      return boolValue === true;
    }).withMessage('Data consent must be accepted'),
  
  // Optional: Add validation that uses the Application model
  body('email')
    .custom(async (email) => {
      // Check if email already exists (if you want to prevent duplicate submissions)
      const existingApplication = await Application.findOne({ email });
      if (existingApplication) {
        throw new Error('An application with this email already exists');
      }
      return true;
    })
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: (error as any).path || (error as any).param,
      message: error.msg
    }));
    
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
    return;
  }
  
  next();
};

export const validateApplicationStatus: ValidationChain[] = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'reviewed', 'shortlisted', 'rejected']).withMessage('Invalid status')
];