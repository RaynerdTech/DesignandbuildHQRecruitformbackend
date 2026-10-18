import { Request, Response, NextFunction } from 'express';
import Application, { IApplication } from '../models/Application';
import { deleteFileFromCloudinary } from '../config/cloudinary';
import emailService from '../utils/emailService';

interface CustomRequest extends Request {
  file?: Express.Multer.File & { public_id?: string; secure_url?: string };
}

export class ApplicationController {
  /**
   * Submit a new application
   */
  static async submitApplication(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        fullName,
        email,
        phone,
        location,
        primaryRole,
        customRole,
        experience,
        skills,
        portfolioLinks,
        availability,
        availabilityOther,
        ukHours,
        officeWork,
        salaryRange,
        summary,
        ukClients,
        ukClientsDetails,
        interest,
        accuracyConsent,
        dataConsent
      } = req.body;

      // Parse arrays from stringified JSON if needed
      const parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
      const parsedPortfolioLinks = typeof portfolioLinks === 'string' ? JSON.parse(portfolioLinks) : (portfolioLinks ?? []);

      // Prepare application data
      const applicationData: Partial<IApplication> = {
        fullName,
        email,
        phone,
        location,
        primaryRole,
        customRole: primaryRole === 'Other' ? customRole : undefined,
        experience,
        skills: parsedSkills,
        portfolioLinks: parsedPortfolioLinks.filter((link: string) => typeof link === 'string' && link.trim() !== ''),
        availability,
        availabilityOther: availability === 'Other' ? availabilityOther : undefined,
        ukHours,
        officeWork,
        salaryRange,
        summary,
        ukClients,
        ukClientsDetails: ukClients === 'Yes' ? ukClientsDetails : undefined,
        interest,
        accuracyConsent: accuracyConsent === 'true' || accuracyConsent === true,
        dataConsent: dataConsent === 'true' || dataConsent === true,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      // Add CV URL if file was uploaded
      if (req.file) {
        applicationData.cvUrl = req.file.path;
        applicationData.cvPublicId = req.file.filename;
        applicationData.cvOriginalName = req.file.originalname;
        applicationData.cvSize = req.file.size;
        applicationData.cvMimetype = req.file.mimetype;
      }

      // Create application
      const application = new Application(applicationData);
      await application.save();

      // The application is stored before email delivery is attempted. Email
      // errors are logged accurately but do not invalidate the saved application.
      // SEND CONFIRMATION EMAIL TO APPLICANT
      try {
        await emailService.sendApplicationConfirmation(email, fullName);
        console.log(`Applicant email accepted by Resend for application ${application._id}`);
      } catch (emailError) {
        console.error(`Applicant email failed for application ${application._id}:`, emailError);
      }

      // SEND NOTIFICATION EMAIL TO ADMIN - ADDED THIS
      try {
        await emailService.sendAdminNotification(application);
        console.log(`Admin email accepted by Resend for application ${application._id}`);
      } catch (adminEmailError) {
        console.error(`Admin email failed for application ${application._id}:`, adminEmailError);
      }

      // Send success response
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          id: application._id,
          fullName: application.fullName,
          email: application.email,
          submissionDate: application.submissionDate,
          status: application.status
        }
      });

    } catch (error) {
      // If there was a file uploaded but error occurred, delete it from Cloudinary
      if (req.file?.filename) {
        try {
          await deleteFileFromCloudinary(req.file.filename);
        } catch (deleteError) {
          console.error('Failed to delete uploaded file after error:', deleteError);
        }
      }
      next(error);
    }
  }

  /**
   * Update application status
   */
  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const application = await Application.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).select('-__v');

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Application not found'
        });
        return;
      }

      // SEND STATUS UPDATE EMAIL
      try {
        await emailService.sendStatusUpdate(application.email, application.fullName, status);
        console.log(`Status email accepted by Resend for application ${application._id}`);
      } catch (emailError) {
        console.error('❌ Failed to send status update email:', emailError);
      }

      res.json({
        success: true,
        message: 'Application status updated',
        data: application
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all applications (with pagination and filtering)
   */
  static async getApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        limit = '10',
        status,
        role,
        experience,
        sortBy = 'submissionDate',
        sortOrder = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = {};
      if (status) filter.status = status;
      if (role) filter.primaryRole = role;
      if (experience) filter.experience = experience;

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      // Execute query
      const [applications, total] = await Promise.all([
        Application.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .select('-__v')
          .lean(),
        Application.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limitNum);
      const hasNext = pageNum < totalPages;
      const hasPrev = pageNum > 1;

      res.json({
        success: true,
        data: applications,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          hasNext,
          hasPrev,
          limit: limitNum
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single application by ID
   */
  static async getApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const application = await Application.findById(id).select('-__v');

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Application not found'
        });
        return;
      }

      res.json({
        success: true,
        data: application
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete application
   */
  static async deleteApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const application = await Application.findById(id);

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Application not found'
        });
        return;
      }

      // Delete CV from Cloudinary if exists
      if (application.cvPublicId) {
        try {
          await deleteFileFromCloudinary(application.cvPublicId);
        } catch (deleteError) {
          console.error('Failed to delete CV from Cloudinary:', deleteError);
        }
      }

      // Delete application from database
      await application.deleteOne();

      res.json({
        success: true,
        message: 'Application deleted successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get application statistics
   */
  static async getStatistics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await Promise.all([
        // Total applications
        Application.countDocuments(),
        
        // Applications by status
        Application.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        
        // Applications by role (including custom roles)
        Application.aggregate([
          {
            $project: {
              displayRole: {
                $cond: {
                  if: { $eq: ['$primaryRole', 'Other'] },
                  then: '$customRole',
                  else: '$primaryRole'
                }
              }
            }
          },
          { $group: { _id: '$displayRole', count: { $sum: 1 } } }
        ]),
        
        // Applications by experience
        Application.aggregate([
          { $group: { _id: '$experience', count: { $sum: 1 } } }
        ]),
        
        // Daily submissions (last 7 days)
        Application.aggregate([
          {
            $match: {
              submissionDate: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$submissionDate' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);

      const [total, statusStats, roleStats, experienceStats, dailyStats] = stats;

      res.json({
        success: true,
        data: {
          total,
          status: statusStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {} as Record<string, number>),
          roles: roleStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {} as Record<string, number>),
          experience: experienceStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {} as Record<string, number>),
          dailySubmissions: dailyStats
        }
      });

    } catch (error) {
      next(error);
    }
  }
}