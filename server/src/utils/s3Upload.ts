import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'hars-submissions-henryhjna';
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_BANNER_SIZE = 20 * 1024 * 1024; // 20MB

export const uploadPhotoToS3 = async (
  file: Express.Multer.File,
  folder: string = 'photos',
  maxSize: number = MAX_PHOTO_SIZE
): Promise<string> => {
  // Validate file size
  if (file.size > maxSize) {
    const limitMB = maxSize / 1024 / 1024;
    throw new Error(`File size exceeds ${limitMB}MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed types: JPEG, PNG, WebP`);
  }

  const fileExt = file.originalname.split('.').pop();
  const randomId = crypto.randomUUID();
  const fileName = `${folder}/${randomId}.${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL removed - bucket must have public read policy or use presigned URLs
  });

  await s3Client.send(command);

  // Return the S3 URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

export const uploadBannerToS3 = async (
  file: Express.Multer.File
): Promise<string> => {
  return uploadPhotoToS3(file, 'banners', MAX_BANNER_SIZE);
};

export const uploadPdfToS3 = async (
  file: Express.Multer.File
): Promise<string> => {
  const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

  // Validate file size
  if (file.size > MAX_PDF_SIZE) {
    throw new Error(`File size exceeds 10MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  // Validate file type
  if (file.mimetype !== 'application/pdf') {
    throw new Error(`Invalid file type. Only PDF files are allowed`);
  }

  const fileExt = file.originalname.split('.').pop();
  const randomId = crypto.randomUUID();
  const fileName = `submissions/${randomId}.${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL removed - bucket must have public read policy or use presigned URLs
  });

  await s3Client.send(command);

  // Return the S3 URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

export const uploadProfilePhotoToS3 = async (
  file: Express.Multer.File
): Promise<string> => {
  return uploadPhotoToS3(file, 'profile-photos', MAX_PHOTO_SIZE);
};

export const deletePhotoFromS3 = async (photoUrl: string): Promise<void> => {
  // Extract key from URL
  const url = new URL(photoUrl);
  const key = url.pathname.substring(1); // Remove leading slash

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  // Let errors propagate to the caller
};
