import multer from 'multer';
import fs from 'fs';

const memoryStorage = multer.memoryStorage();
const MB = 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const imageFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

const pdfFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

export const imageUpload = (maxMb: number) =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: maxMb * MB },
    fileFilter: imageFileFilter,
  });

export const pdfUpload = (maxMb: number) =>
  multer({
    storage: memoryStorage,
    limits: { fileSize: maxMb * MB },
    fileFilter: pdfFileFilter,
  });

// Default PDF upload (10MB) — used by submission routes
export const upload = pdfUpload(10);

export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
