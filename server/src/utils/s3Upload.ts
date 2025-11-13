import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'hars-submissions-henryhjna';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const uploadPhotoToS3 = async (
  file: Express.Multer.File,
  folder: string = 'photos'
): Promise<string> => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 2MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
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
    ACL: 'public-read', // Make photos publicly accessible
  });

  await s3Client.send(command);

  // Return the S3 URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

export const deletePhotoFromS3 = async (photoUrl: string): Promise<void> => {
  try {
    // Extract key from URL
    const url = new URL(photoUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting photo from S3:', error);
    // Don't throw error, just log it
  }
};
