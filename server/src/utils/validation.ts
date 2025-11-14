import crypto from 'crypto';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateRandomToken = (length: number = 32): string => {
  // Use cryptographically secure random bytes
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

export const sanitizeUser = (user: any) => {
  const { password_hash, email_verification_token, reset_password_token, ...sanitized } = user;
  return sanitized;
};
