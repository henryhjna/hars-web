import nodemailer from 'nodemailer';
import { User } from '../types';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@hanyanghars.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service is ready');
  }
});

export const sendVerificationEmail = async (
  user: User,
  token: string
): Promise<void> => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: EMAIL_FROM,
    to: user.email,
    subject: 'Verify Your Email - Hanyang Accounting Research Symposium',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a73e8; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background-color: #1a73e8;
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to HARS!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name} ${user.last_name},</h2>
            <p>Thank you for registering for the Hanyang Accounting Research Symposium platform.</p>
            <p>Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hanyang Accounting Research Symposium. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (
  user: User,
  token: string
): Promise<void> => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: EMAIL_FROM,
    to: user.email,
    subject: 'Reset Your Password - Hanyang Accounting Research Symposium',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a73e8; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background-color: #1a73e8;
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name} ${user.last_name},</h2>
            <p>We received a request to reset your password for your HARS account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              If you did not request a password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hanyang Accounting Research Symposium. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendSubmissionConfirmationEmail = async (
  user: User,
  submissionTitle: string,
  eventTitle: string
): Promise<void> => {
  const mailOptions = {
    from: EMAIL_FROM,
    to: user.email,
    subject: `Submission Received: ${submissionTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a73e8; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .info-box { background-color: #e3f2fd; padding: 15px; border-left: 4px solid #1a73e8; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Submission Received</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name} ${user.last_name},</h2>
            <p>Your paper submission has been successfully received!</p>
            <div class="info-box">
              <strong>Event:</strong> ${eventTitle}<br>
              <strong>Paper Title:</strong> ${submissionTitle}
            </div>
            <p>Your submission is now under review. We will notify you once the review process is complete.</p>
            <p>You can view and manage your submissions by logging into your account.</p>
            <p>Thank you for your participation!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hanyang Accounting Research Symposium. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (user: User): Promise<void> => {
  const mailOptions = {
    from: EMAIL_FROM,
    to: user.email,
    subject: 'Welcome to Hanyang Accounting Research Symposium',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a73e8; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to HARS!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.first_name} ${user.last_name},</h2>
            <p>Your email has been verified successfully!</p>
            <p>You can now:</p>
            <ul>
              <li>Submit papers to upcoming events</li>
              <li>View past event archives</li>
              <li>Manage your submissions</li>
              <li>Update your profile</li>
            </ul>
            <p>We look forward to your participation in the Hanyang Accounting Research Symposium.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Hanyang Accounting Research Symposium. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
