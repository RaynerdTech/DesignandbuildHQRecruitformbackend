import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  primaryRole: string;
  customRole?: string;
  experience: string;
  skills: string[];
  portfolioLinks: string[];
  cvUrl?: string;
  cvPublicId?: string;
  cvOriginalName?: string;
  cvSize?: number;
  cvMimetype?: string;
  availability: string;
  availabilityOther?: string;
  ukHours: string;
  officeWork: string;
  salaryRange: string;
  summary: string;
  ukClients: string;
  ukClientsDetails?: string;
  interest: string;
  accuracyConsent: boolean;
  dataConsent: boolean;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  submissionDate: Date;
  ipAddress?: string;
  userAgent?: string;
}

const ApplicationSchema: Schema<IApplication> = new Schema<IApplication>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  primaryRole: {
    type: String,
    required: [true, 'Primary role is required'],
    enum: [
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
    ]
  },
  customRole: {
    type: String,
    trim: true,
    maxlength: [100, 'Custom role cannot exceed 100 characters'],
    sparse: true
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    enum: ['0–1', '1–3', '3–5', '5+'] as const
  },
  skills: {
    type: [String],
    required: [true, 'At least one skill is required'],
    validate: {
      validator: function(skills: string[]) {
        return skills.length > 0;
            },
            message: 'At least one skill is required'
          }
        },
       portfolioLinks: {
  type: [String],
  default: [],
  validate: {
    // 1. Explicitly type 'links' as an array of strings
    validator: function(links: string[]) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,256})([/\w .-]*)*\/?$/;
      
      // 2. Explicitly type 'link' as a string
      return links.every((link: string) => urlRegex.test(link));
    },
    message: 'All portfolio links must be valid URLs'
  }
},
        cvUrl: {
          type: String,
          trim: true,
          sparse: true
        },
        cvPublicId: {
          type: String,
          trim: true,
          sparse: true
        },
        cvOriginalName: {
          type: String,
          trim: true,
          sparse: true
        },
        cvSize: {
          type: Number,
          default: 0
        },
        cvMimetype: {
          type: String,
          trim: true,
          sparse: true
        },
        availability: {
          type: String,
          required: [true, 'Availability is required'],
          enum: ['Immediate', '2 weeks', '1 month', 'Other'] as const
        },
        availabilityOther: {
          type: String,
          trim: true,
          maxlength: [200, 'Custom availability cannot exceed 200 characters'],
          sparse: true
        },
        ukHours: {
          type: String,
          required: [true, 'UK hours preference is required'],
          enum: ['Yes', 'Partially', 'No'] as const
        },
        officeWork: {
          type: String,
          required: [true, 'Office work preference is required'],
          enum: ['Yes', 'No', 'Hybrid'] as const
        },
        salaryRange: {
          type: String,
          required: [true, 'Salary range is required'],
          enum: ['Below ₦400,000', '₦400,000 – ₦600,000', '₦600,000 – ₦900,000', '₦900,000 – ₦1,500,000', '₦1,500,000+'] as const
        },
        summary: {
          type: String,
          trim: true,
        },
        ukClients: {
          type: String,
          required: [true, 'UK clients experience is required'],
          enum: ['Yes', 'No'] as const
        },
        ukClientsDetails: {
          type: String,
          trim: true,
          maxlength: [1000, 'UK clients details cannot exceed 1000 characters'],
          sparse: true
        },
        interest: {
          type: String,
          required: [true, 'Interest statement is required'],
          trim: true,
          minlength: [50, 'Interest statement must be at least 50 characters'],
          maxlength: [1000, 'Interest statement cannot exceed 1000 characters']
        },
        accuracyConsent: {
          type: Boolean,
          required: [true, 'Accuracy consent is required'],
          validate: {
            validator: function(value: boolean): boolean {
        return value === true;
      },
      message: 'Accuracy consent must be accepted'
    }
  },
  dataConsent: {
    type: Boolean,
    required: [true, 'Data consent is required'],
    validate: {
      validator: function(value: boolean) {
        return value === true;
      },
      message: 'Data consent must be accepted'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected'] as const,
    default: 'pending'
  },
  submissionDate: {
    type: Date,
    default: () => new Date()
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(_doc, ret) {
      // Remove sensitive/unnecessary fields from JSON output
      delete ret.__v;
      delete ret.ipAddress;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(_doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
ApplicationSchema.index({ email: 1, submissionDate: -1 });
ApplicationSchema.index({ status: 1, submissionDate: -1 });
ApplicationSchema.index({ primaryRole: 1, experience: 1 });
ApplicationSchema.index({ availability: 1 });
ApplicationSchema.index({ skills: 1 }); // For skill-based searches

// Virtual for formatted role display
ApplicationSchema.virtual('displayRole').get(function(this: IApplication) {
  return this.customRole || this.primaryRole;
});

// Virtual for formatted availability display
ApplicationSchema.virtual('displayAvailability').get(function(this: IApplication) {
  return this.availability === 'Other' && this.availabilityOther 
    ? this.availabilityOther 
    : this.availability;
});

// Virtual for CV download URL with proper filename
ApplicationSchema.virtual('cvDownloadUrl').get(function(this: IApplication) {
  if (!this.cvUrl) return null;
  
  // Add download parameter to Cloudinary URL for proper filename
  const originalName = this.cvOriginalName || `CV_${this.fullName.replace(/\s+/g, '_')}.pdf`;
  const encodedName = encodeURIComponent(originalName);
  
  if (this.cvUrl.includes('cloudinary.com')) {
    return `${this.cvUrl}?filename=${encodedName}&fl_attachment`;
  }
  
  return this.cvUrl;
});

// Pre-save middleware
ApplicationSchema.pre('save', function(next) {
  const doc = this as IApplication;
  
  // Ensure skills are unique and trimmed
  if (doc.skills) {
    doc.skills = [...new Set(doc.skills.map(skill => skill.trim()))];
  }
  
  // Ensure portfolio links are unique and trimmed
  if (doc.portfolioLinks) {
    doc.portfolioLinks = [...new Set(doc.portfolioLinks.map(link => link.trim()))];
  }
  
  // Sanitize custom role if exists
  if (doc.customRole) {
    doc.customRole = doc.customRole.trim();
  }
  
  // Sanitize custom availability if exists
  if (doc.availabilityOther) {
    doc.availabilityOther = doc.availabilityOther.trim();
  }
  
  next();
});

// Pre-validate middleware to ensure custom fields when "Other" is selected
ApplicationSchema.pre('validate', function(next) {
  const doc = this as IApplication;
  
  // If primaryRole is "Other", customRole is required
  if (doc.primaryRole === 'Other' && (!doc.customRole || doc.customRole.trim() === '')) {
    this.invalidate('customRole', 'Custom role is required when selecting "Other"', doc.customRole);
  }
  
  // If availability is "Other", availabilityOther is required
  if (doc.availability === 'Other' && (!doc.availabilityOther || doc.availabilityOther.trim() === '')) {
    this.invalidate('availabilityOther', 'Custom availability is required when selecting "Other"', doc.availabilityOther);
  }
  
  next();
});

// Type-safe model creation
const Application = mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;