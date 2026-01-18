import { Resend } from 'resend';
import dotenv from 'dotenv';
import { IApplication } from '../models/Application'; // Add this import

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string = 'DesignandBuildHQ <info@designandbuildhq.com>';
  private logoUrl: string = 'https://media.licdn.com/dms/image/v2/D4E0BAQFO3OsArarhCQ/company-logo_100_100/B4EZvAhWsMJUAU-/0/1768461528195?e=1770249600&v=beta&t=PnJTrImwzC-e0EWgcjcwV3fj-kQc2e5sOLeDiPZ-_Gk';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.log('⚠️ Resend API key not found. Email service disabled.');
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      console.log('✅ Resend email service initialized');
      
      this.fromEmail = 'DesignandBuildHQ <info@designandbuildhq.com>';
    } catch (error) {
      console.error('❌ Failed to initialize Resend:', error);
      this.resend = null;
    }
  }

  
   
  async sendApplicationConfirmation(to: string, applicantName: string): Promise<void> {
    if (!this.resend) {
      console.log('📧 Email service disabled - skipping confirmation to:', to);
      return;
    }

    const html = `
      <!DOCTYPE html>
     <html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <style>
    :root {
      color-scheme: light only;
      supported-color-schemes: light;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f4 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4 !important;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; padding: 20px 6px; background-color: #f4f4f4 !important;">
    
    <div style="background-color: #f8f9fa !important; padding: 40px 30px; text-align: center; border-bottom: 3px solid #1a4d1a;">
      <img src="${this.logoUrl}" alt="DesignandbuildHQ Logo" style="max-width: 140px; height: auto; margin-bottom: 24px; display: block; margin-left: auto; margin-right: auto;" />
      
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1a4d1a !important; letter-spacing: 0.5px;">DesignandbuildHQ</h1>
      <p style="margin: 12px 0 0; font-size: 18px; color: #666666 !important; font-weight: 500;">Recruitment Team</p>
    </div>
    
    <div class="content-section" style="padding: 40px 35px; background-color: #ffffff !important; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      
      <h2 style="color: #1a4d1a !important; margin: 0 0 24px; font-size: 22px; font-weight: 600; letter-spacing: 0.3px;">Application Received</h2>
      
      <p style="font-size: 16px; line-height: 1.7; color: #333333 !important; margin: 0 0 20px;">Hello <strong style="color: #1a4d1a !important;">${applicantName}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.7; color: #333333 !important; margin: 0 0 24px;">
        Thank you for taking the time to submit your information and portfolio to <strong>DesignandbuildHQ</strong>.
      </p>

      <div style="background-color: #f8faf9 !important; padding: 24px; border-radius: 8px; border-left: 4px solid #1a4d1a; margin: 24px 0;">
        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.7; color: #333333 !important;">
          We’re writing to confirm that your application has been successfully received and securely stored in our talent database. Our team will review your details, and where there is a strong match with current or upcoming opportunities, we’ll be in touch.
        </p>
        <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #333333 !important;">
          DesignandbuildHQ works with UK and international clients to build reliable, high-quality digital teams, and we keep a long-term view when engaging with talent. Even if there isn’t an immediate role available, your profile may be considered for future projects.
        </p>
      </div>
      
      <div style="margin-top: 32px; padding: 20px 0; border-top: 1px solid #e8e8e8;">
        <p style="margin: 0 0 12px; font-size: 13px; color: #666666 !important; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Submission Details</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #666666 !important; width: 140px;">Status:</td>
            <td style="padding: 8px 0; font-size: 16px; color: #1a4d1a !important; font-weight: 600;">In Talent Database</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #666666 !important;">Date Received:</td>
            <td style="padding: 8px 0; font-size: 16px; color: #333333 !important;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 28px; padding: 18px; background-color: #f0f7f0 !important; border-radius: 6px; border: 1px solid #d4e8d4;">
        <p style="margin: 0; font-size: 16px; color: #1a4d1a !important; line-height: 1.6;">
          <strong>Next Steps:</strong> You don’t need to take any further action at this stage. If your availability, skills, or contact details change, you’re welcome to reach out and update us.
        </p>
      </div>
      
      <div style="margin-top: 44px; padding-top: 24px; border-top: 1px solid #e8e8e8;">
        <p style="margin: 0 0 8px; font-size: 16px; color: #333333 !important;">Kind regards,</p>
        <p style="margin: 0; font-weight: 600; color: #1a4d1a !important; font-size: 16px;">The DesignandbuildHQ Recruitment Team</p>
      </div>
    </div>
    
    <div style="margin-top: 24px; padding: 20px; text-align: center; font-size: 12px; color: #888888 !important; line-height: 1.6; background-color: #fafafa !important; border-radius: 8px;">
      <p style="margin: 0 0 8px; color: #888888 !important;">This is an automated confirmation of your submission.</p>
      <p style="margin: 0; color: #888888 !important;">© ${new Date().getFullYear()} DesignandbuildHQ. All rights reserved.</p>
    </div>
    
  </div>
</body>
</html>
    `;

    await this.sendEmail({
      to,
      subject: 'Application Acknowledgment - DesignandBuildHQ',
      html
    });
  }

  async sendStatusUpdate(to: string, applicantName: string, status: string): Promise<void> {
    if (!this.resend) {
      console.log('📧 Email service disabled - skipping status update to:', to);
      return;
    }

    const statusConfig: Record<string, { color: string; bgColor: string; title: string; message: string }> = {
      'reviewed': {
        color: '#2563eb',
        bgColor: '#eff6ff',
        title: 'Application Reviewed',
        message: 'Your application has been carefully reviewed by our recruitment team.'
      },
      'shortlisted': {
        color: '#1a4d1a',
        bgColor: '#f0f7f0',
        title: 'Application Shortlisted',
        message: 'We are pleased to inform you that your application has been shortlisted for further consideration.'
      },
      'rejected': {
        color: '#dc2626',
        bgColor: '#fef2f2',
        title: 'Application Status Update',
        message: 'We appreciate your interest in joining DesignandBuildHQ.'
      }
    };

    const config = statusConfig[status] || {
      color: '#666666',
      bgColor: '#f4f4f4',
      title: 'Application Status Update',
      message: 'Your application status has been updated.'
    };

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light only">
        <meta name="supported-color-schemes" content="light">
        <style>
          :root {
            color-scheme: light only;
            supported-color-schemes: light;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4 !important;">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4 !important;">
          
          <!-- Header with Logo -->
          <div style="background-color: #f8f9fa !important; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center; border-bottom: 3px solid #1a4d1a;">
            <img src="${this.logoUrl}" alt="DesignandBuildHQ Logo" style="max-width: 140px; height: auto; margin-bottom: 24px; display: block; margin-left: auto; margin-right: auto;" />
            
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1a4d1a !important; letter-spacing: 0.5px;">DesignandBuildHQ</h1>
            <p style="margin: 12px 0 0; font-size: 16px; color: #666666 !important; font-weight: 500;">Recruitment Status Update</p>
          </div>
          
          <!-- Main Content -->
          <div class="content-section" style="padding: 40px 35px; background-color: #ffffff !important; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            
            <!-- Status Badge -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; padding: 12px 32px; background-color: ${config.color} !important; color: #ffffff !important; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 1px; text-transform: uppercase;">
                ${status.toUpperCase()}
              </div>
            </div>
            
            <h2 style="color: #1a4d1a !important; margin: 0 0 24px; font-size: 22px; font-weight: 600; letter-spacing: 0.3px;">${config.title}</h2>
            
            <p style="font-size: 16px; line-height: 1.7; color: #333333 !important; margin: 0 0 20px;">Dear <strong style="color: #1a4d1a !important;">${applicantName}</strong>,</p>
            
            <div style="background-color: ${config.bgColor} !important; padding: 28px; border-radius: 8px; border-left: 4px solid ${config.color}; margin: 24px 0;">
              <p style="margin: 0 0 16px; font-size: 16px; color: ${config.color} !important; font-weight: 600; line-height: 1.6;">
                ${config.message}
              </p>
              
              ${status === 'shortlisted' ? `
              <div style="margin-top: 24px; padding: 20px; background-color: #ffffff !important; border-radius: 6px; border: 1px solid #d4e8d4;">
                <p style="margin: 0 0 16px; font-weight: 600; color: #1a4d1a !important; font-size: 16px;">Next Steps in the Process:</p>
                <ol style="margin: 0; padding-left: 24px; color: #333333 !important; font-size: 16px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">A member of our team will contact you within <strong>3 business days</strong> to schedule an interview</li>
                  <li style="margin-bottom: 8px;">Please prepare for a comprehensive assessment (technical and/or behavioral interview)</li>
                  <li style="margin-bottom: 0;">Ensure your portfolio, references, and relevant documentation are readily available</li>
                </ol>
              </div>
              ` : ''}
              
              ${status === 'rejected' ? `
              <div style="margin-top: 20px; padding: 20px; background-color: #ffffff !important; border-radius: 6px;">
                <p style="margin: 0; color: #555555 !important; font-size: 16px; line-height: 1.7;">
                  While we have decided to proceed with other candidates for this particular position, we were impressed by your qualifications. We encourage you to monitor our careers page and apply for future opportunities that align with your expertise.
                </p>
              </div>
              ` : ''}
            </div>
            
            <!-- Reference Number -->
            <div style="margin-top: 32px; padding: 20px 0; border-top: 1px solid #e8e8e8;">
              <p style="margin: 0; font-size: 13px; color: #666666 !important;">
                <strong>Application Reference:</strong> ${applicantName.replace(/\s+/g, '_').toUpperCase()}_${Date.now().toString().slice(-6)}
              </p>
            </div>
            
            <!-- Signature -->
            <div style="margin-top: 44px; padding-top: 24px; border-top: 1px solid #e8e8e8;">
              <p style="margin: 0 0 8px; font-size: 16px; color: #333333 !important;">Respectfully,</p>
              <p style="margin: 0; font-weight: 600; color: #1a4d1a !important; font-size: 16px;">Human Resources Department</p>
              <p style="margin: 4px 0 0; font-size: 16px; color: #666666 !important;">DesignandBuildHQ</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 24px; padding: 20px; text-align: center; font-size: 12px; color: #888888 !important; line-height: 1.6; background-color: #fafafa !important; border-radius: 8px;">
            <p style="margin: 0 0 8px; color: #888888 !important;">This is an automated status notification. Please do not reply to this message.</p>
            <p style="margin: 0; color: #888888 !important;">© ${new Date().getFullYear()} DesignandBuildHQ. All rights reserved.</p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: `Application Update: ${config.title} - DesignandBuildHQ`,
      html
    });
  }

  // ADD THIS METHOD FOR ADMIN NOTIFICATIONS
// ADD THIS METHOD FOR ADMIN NOTIFICATIONS
 async sendAdminNotification(application: IApplication): Promise<void> {
    if (!this.resend) {
      console.log('📧 Email service disabled - skipping admin notification');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'your-admin-email@example.com';
    const displayRole = application.customRole || application.primaryRole;
    const displayAvailability = application.availability === 'Other' && application.availabilityOther 
      ? application.availabilityOther 
      : application.availability;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
        
        <table role="presentation" style="width: 100%; max-width: 650px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          
          <tr>
            <td style="padding: 40px 40px 30px; background-color: #1a4d1a;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">New Application Received</h1>
              <p style="margin: 8px 0 0; font-size: 16px; font-weight: 500; color: #ffffff;">DesignandBuildHQ Recruitment System</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              
              <h2 style="margin: 0 0 25px; font-size: 22px; font-weight: 700; color: #1a4d1a;">${application.fullName}</h2>
              
              <table role="presentation" style="width: 100%; margin-bottom: 35px;">
                <tr>
                  <td style="padding: 12px 0; width: 30%; vertical-align: top;">
                    <strong style="font-size: 16px; font-weight: 700; color: #333;">Role:</strong>
                  </td>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="font-size: 16px; font-weight: 600; color: #1a4d1a;">${displayRole}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; width: 30%; vertical-align: top;">
                    <strong style="font-size: 16px; font-weight: 700; color: #333;">Email:</strong>
                  </td>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="font-size: 16px; font-weight: 600; color: #333;">${application.email}</span>
                  </td>
                </tr>
                
           <tr>
                  <td style="padding: 12px 0; width: 35%; vertical-align: top;">
                    <strong style="font-size: 16px; font-weight: 700; color: #333;">Portfolio(s):</strong>
                  </td>
                  <td style="padding: 12px 0; vertical-align: top;">
                    ${application.portfolioLinks && application.portfolioLinks.length > 0 
                      ? application.portfolioLinks.map(link => `
                          <a href="${link}" target="_blank" style="display: block; font-size: 15px; font-weight: 600; color: #1a4d1a; text-decoration: underline; margin-bottom: 6px;">
                            ${link}
                          </a>
                        `).join('')
                      : '<span style="color: #999;">No links provided</span>'}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px 0; width: 30%; vertical-align: top;">
                    <strong style="font-size: 16px; font-weight: 700; color: #333;">Phone:</strong>
                  </td>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="font-size: 16px; font-weight: 600; color: #333;">${application.phone}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; width: 30%; vertical-align: top;">
                    <strong style="font-size: 16px; font-weight: 700; color: #333;">Location:</strong>
                  </td>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="font-size: 16px; font-weight: 600; color: #333;">${application.location}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; width: 30%; vertical-align: top;">
                    <strong style="font-size: 16px; font-weight: 700; color: #333;">Experience:</strong>
                  </td>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <span style="font-size: 16px; font-weight: 600; color: #333;">${application.experience} years</span>
                  </td>
                </tr>
              </table>
              
              <div style="margin-bottom: 35px;">
                <h3 style="margin: 0 0 16px; font-size: 17px; font-weight: 700; color: #333;">Skills</h3>
                <div>
                  ${application.skills.map(skill => `<span style="display: inline-block; background-color: #f0f0f0; color: #333; padding: 8px 15px; margin: 4px 4px 4px 0; font-size: 15px; font-weight: 600; border-radius: 4px;">${skill}</span>`).join('')}
                </div>
              </div>
              
              <div style="margin-bottom: 35px;">
                <h3 style="margin: 0 0 16px; font-size: 17px; font-weight: 700; color: #333;">Work Preferences</h3>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 12px 0; width: 30%; vertical-align: top;">
                      <strong style="font-size: 16px; font-weight: 700; color: #333;">Availability:</strong>
                    </td>
                    <td style="padding: 12px 0; vertical-align: top;">
                      <span style="font-size: 16px; font-weight: 600; color: #333;">${displayAvailability}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; width: 30%; vertical-align: top;">
                      <strong style="font-size: 16px; font-weight: 700; color: #333;">UK Hours:</strong>
                    </td>
                    <td style="padding: 12px 0; vertical-align: top;">
                      <span style="font-size: 16px; font-weight: 600; color: #333;">${application.ukHours}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; width: 30%; vertical-align: top;">
                      <strong style="font-size: 16px; font-weight: 700; color: #333;">Office Work:</strong>
                    </td>
                    <td style="padding: 12px 0; vertical-align: top;">
                      <span style="font-size: 16px; font-weight: 600; color: #333;">${application.officeWork}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; width: 30%; vertical-align: top;">
                      <strong style="font-size: 16px; font-weight: 700; color: #333;">Salary Range:</strong>
                    </td>
                    <td style="padding: 12px 0; vertical-align: top;">
                      <span style="font-size: 16px; font-weight: 600; color: #333;">${application.salaryRange}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-bottom: 35px;">
                <h3 style="margin: 0 0 16px; font-size: 17px; font-weight: 700; color: #333;">Summary</h3>
                <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #333; font-weight: 500;">${application.summary}</p>
              </div>
              
              <div style="padding: 20px; background-color: #f9f9f9; border-left: 4px solid #1a4d1a; margin-bottom: 35px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; width: 30%; vertical-align: top;">
                      <strong style="font-size: 15px; font-weight: 700; color: #666;">Application ID:</strong>
                    </td>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <span style="font-size: 15px; font-weight: 600; color: #333; font-family: monospace;">${application._id}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; width: 30%; vertical-align: top;">
                      <strong style="font-size: 15px; font-weight: 700; color: #666;">Submitted:</strong>
                    </td>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <span style="font-size: 15px; font-weight: 600; color: #333;">${new Date(application.submissionDate).toLocaleString()}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="padding-right: 10px;">
                    <a href="${process.env.FRONTEND_URL || '#'}/admin/applications/${application._id}" 
                       style="display: block; padding: 16px 24px; background-color: #1a4d1a; color: #ffffff; text-decoration: none; text-align: center; font-size: 16px; font-weight: 700; border-radius: 4px;">
                      View Full Application
                    </a>
                  </td>
                  <td style="padding-left: 10px;">
                    <a href="${process.env.FRONTEND_URL || '#'}/admin/applications" 
                       style="display: block; padding: 16px 24px; background-color: #4a90e2; color: #ffffff; text-decoration: none; text-align: center; font-size: 16px; font-weight: 700; border-radius: 4px;">
                      All Applications
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <tr>
            <td style="padding: 25px 40px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0; font-size: 13px; font-weight: 500; color: #666;">This is an automated notification from DesignandBuildHQ recruitment system</p>
              <p style="margin: 8px 0 0; font-size: 12px; font-weight: 500; color: #999;">© ${new Date().getFullYear()} DesignandBuildHQ. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
        
      </body>
      </html>
    `;

    await this.sendEmail({
      to: adminEmail,
      subject: `New Application: ${application.fullName} - ${displayRole}`,
      html
    });
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.resend) {
      console.error('Resend not initialized');
      return;
    }

    try {
      console.log('📧 Attempting to send email to:', options.to);
      
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        console.error(`❌ resend error for ${options.to}:`, error);
        return;
      }

      console.log(`✅ Email sent to ${options.to}:`, data?.id);
    } catch (error) {
      console.error(`❌ Error sending email to ${options.to}:`, error);
    }
  }
}

export default new EmailService();