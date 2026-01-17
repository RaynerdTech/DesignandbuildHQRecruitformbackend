import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Validate Cloudinary config
const validateCloudinaryConfig = (): void => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing Cloudinary environment variables: ${missing.join(', ')}`);
  }
};

// Initialize Cloudinary
try {
  validateCloudinaryConfig();
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true
  });

  console.log('✅ Cloudinary configured successfully');
} catch (error) {
  console.error(`❌ Cloudinary configuration failed: ${(error as Error).message}`);
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'recruitment_applications',
    resource_type: 'raw',
    access_mode: 'public',
    public_id: () => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `cv-${uniqueSuffix}.pdf`;
    },
  } as any,
});


// File filter
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
  }
};

// Multer upload configuration
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Utility function to delete file from Cloudinary
export const deleteFileFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    console.log(`File deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`Error deleting file from Cloudinary: ${(error as Error).message}`);
    throw error;
  }
};

export default cloudinary;