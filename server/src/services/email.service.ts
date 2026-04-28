import nodemailer from 'nodemailer';
import { User } from '../types';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@hanyanghars.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Consistent sender name for all emails
const EMAIL_SENDER = `"HARS Organizing Committee" <${EMAIL_FROM}>`;

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
    from: EMAIL_SENDER,
    to: user.email,
    subject: 'Verify Your Email - Hanyang Accounting Research Symposium',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1a73e8; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Welcome to HARS!</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="margin-top: 0;">Hello ${user.first_name} ${user.last_name},</h2>
            <p>Thank you for registering for the Hanyang Accounting Research Symposium platform.</p>
            <p>Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 30px; background-color: #1a73e8; color: #ffffff !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600;">Verify Email</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create this account, please ignore this email.</p>
          </div>
          <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
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
    from: EMAIL_SENDER,
    to: user.email,
    subject: 'Reset Your Password - Hanyang Accounting Research Symposium',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1a73e8; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Password Reset Request</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="margin-top: 0;">Hello ${user.first_name} ${user.last_name},</h2>
            <p>We received a request to reset your password for your HARS account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #1a73e8; color: #ffffff !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; margin: 20px 0;">
              <strong>Security Notice:</strong><br>
              If you did not request a password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
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
    from: EMAIL_SENDER,
    to: user.email,
    subject: `Submission Received: ${submissionTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1a73e8; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Submission Received</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="margin-top: 0;">Hello ${user.first_name} ${user.last_name},</h2>
            <p>Your paper submission has been successfully received!</p>
            <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #1a73e8; margin: 20px 0;">
              <strong>Event:</strong> ${eventTitle}<br>
              <strong>Paper Title:</strong> ${submissionTitle}
            </div>
            <p>Your submission has been recorded and will be assigned to reviewers shortly. We will notify you once the review process is complete.</p>
            <p>You can view and manage your submissions by logging into your account.</p>
            <p>Thank you for your participation!</p>
          </div>
          <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Hanyang Accounting Research Symposium. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendRegistrationConfirmationEmail = async (
  user: User,
  eventTitle: string,
  eventDate: Date | string,
  lunch: boolean,
  dinner: boolean,
): Promise<void> => {
  const eventDateStr = new Date(eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const meals = [lunch ? 'Lunch' : null, dinner ? 'Dinner' : null].filter(Boolean).join(', ') || 'None';

  const mailOptions = {
    from: EMAIL_SENDER,
    to: user.email,
    subject: `Registration Confirmed: ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1a73e8; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Registration Confirmed</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="margin-top: 0;">Hello ${user.first_name} ${user.last_name},</h2>
            <p>Your registration has been received. We look forward to seeing you at the event.</p>
            <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #1a73e8; margin: 20px 0;">
              <strong>Event:</strong> ${eventTitle}<br>
              <strong>Date:</strong> ${eventDateStr}<br>
              <strong>Meals:</strong> ${meals}
            </div>
            <p>If your plans change, please log in and update your registration so we can adjust catering.</p>
            <p>Thank you!</p>
          </div>
          <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
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
    from: EMAIL_SENDER,
    to: user.email,
    subject: 'Welcome to Hanyang Accounting Research Symposium',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1a73e8; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Welcome to HARS!</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="margin-top: 0;">Hello ${user.first_name} ${user.last_name},</h2>
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
          <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Hanyang Accounting Research Symposium. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendReviewerAssignmentEmail = async (
  reviewer: User,
  submission: any,
  event: any,
  dueDate?: Date
): Promise<void> => {
  const reviewUrl = `${FRONTEND_URL}/reviewer/review/${submission.id}`;
  const dueDateStr = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified';
  const abstractPreview = submission.abstract.length > 200 ? submission.abstract.substring(0, 200) + '...' : submission.abstract;

  const mailOptions = {
    from: EMAIL_SENDER,
    to: reviewer.email,
    subject: `New Review Assignment - ${event.title}`,
    html: `<html><body style="font-family: Arial, sans-serif; background-color: #f8fafc;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);"><tr><td style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); padding: 40px 30px; text-align: center;"><h1 style="margin: 0; color: #fff; font-size: 28px;">Review Assignment</h1><p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">You have been assigned a paper to review</p></td></tr><tr><td style="padding: 40px 30px;"><p style="margin: 0 0 24px 0; color: #1e293b; font-size: 16px;">Dear ${reviewer.prefix || 'Dr.'} ${reviewer.last_name || reviewer.email},</p><p style="margin: 0 0 24px 0; color: #475569; font-size: 15px;">You have been assigned to review a paper submission for <strong>${event.title}</strong>.</p><table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 8px; border: 2px solid #e2e8f0; margin-bottom: 24px;"><tr><td style="padding: 24px;"><h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px;">${submission.title}</h2><p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">${abstractPreview}</p><div style="padding: 8px 12px; background: #e0f2fe; border-radius: 6px; display: inline-block;"><span style="color: #0369a1; font-size: 13px; font-weight: 600;">Author: ${submission.corresponding_author}</span></div></td></tr></table><div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 32px;"><p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Review Due Date:</strong> ${dueDateStr}</p></div><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;"><tr><td align="center"><a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: #fff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Review</a></td></tr></table><p style="margin: 0 0 16px 0; color: #475569; font-size: 14px;">Thank you for your contribution to maintaining the quality of our symposium.</p><p style="margin: 0; color: #64748b; font-size: 14px;">Best regards,<br><strong>HARS Organizing Committee</strong></p></td></tr><tr><td style="background: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0;"><p style="margin: 0; color: #64748b; font-size: 13px; text-align: center;">${event.title} | Hanyang University Business School</p></td></tr></table></td></tr></table></body></html>`
  };

  await transporter.sendMail(mailOptions);
};

// Generate decision email HTML and metadata (single source of truth for preview + send)
export const buildDecisionEmail = (
  author: User,
  submission: any,
  event: any,
  decision: 'accepted' | 'rejected',
  comments?: string
): { subject: string; html: string; to: string } => {
  const isAccepted = decision === 'accepted';
  const gradientColor = isAccepted
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #64748b 0%, #475569 100%)';

  const headerTitle = isAccepted ? 'Congratulations!' : 'Submission Decision';
  const headerSubtitle = `Your submission to the ${event.title}`;

  const bodyMessage = isAccepted
    ? `We are pleased to inform you that your submission has been accepted for presentation at the ${event.title}.`
    : `Thank you for your submission to the ${event.title}. After careful review, we regret to inform you that we are unable to accept your submission for this year's symposium.`;

  const statusLabel = isAccepted ? 'Accepted' : 'Not Accepted';
  const statusColor = isAccepted ? '#16a34a' : '#64748b';

  const nextStepsItems = isAccepted
    ? '<li style="margin-bottom: 8px;">You will receive further information about the presentation schedule</li><li style="margin-bottom: 8px;">Please confirm your attendance by replying to this email</li><li style="margin-bottom: 8px;">Prepare your presentation according to the symposium guidelines</li>'
    : '<li style="margin-bottom: 8px;">We encourage you to consider submitting to future symposiums</li><li style="margin-bottom: 8px;">Your work is valuable and we appreciate your interest</li><li style="margin-bottom: 8px;">Feel free to contact us if you have any questions</li>';

  const commentsSection = comments
    ? `<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 4px; margin: 24px 0;"><h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Additional Comments</h4><p style="margin: 0; color: #1e3a5f; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${comments}</p></div>`
    : '';

  const subject = isAccepted
    ? `Paper Accepted - ${event.title}`
    : `Paper Decision - ${event.title}`;

  const html = `<html><body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;"><table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);"><tr><td style="background: ${gradientColor}; padding: 48px 30px; text-align: center;"><h1 style="margin: 0 0 12px 0; color: #fff; font-size: 30px; font-weight: 700;">${headerTitle}</h1><p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">${headerSubtitle}</p></td></tr><tr><td style="padding: 40px 30px;"><p style="margin: 0 0 24px 0; color: #1e293b; font-size: 16px;">Dear ${author.first_name || 'Author'},</p><p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">${bodyMessage}</p><table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;"><tr><td style="padding: 20px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding: 4px 0;"><span style="color: #64748b; font-size: 13px;">Title:</span></td><td style="padding: 4px 0;"><span style="color: #1e293b; font-size: 14px; font-weight: 600;">${submission.title}</span></td></tr><tr><td style="padding: 4px 0; width: 80px;"><span style="color: #64748b; font-size: 13px;">Status:</span></td><td style="padding: 4px 0;"><span style="color: ${statusColor}; font-size: 14px; font-weight: 600;">${statusLabel}</span></td></tr></table></td></tr></table>${commentsSection}<h3 style="margin: 24px 0 12px 0; color: #1e293b; font-size: 16px; font-weight: 600;">Next Steps</h3><ul style="margin: 0 0 24px 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.6;">${nextStepsItems}</ul></td></tr><tr><td style="background: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0; text-align: center;"><p style="margin: 0 0 4px 0; color: #64748b; font-size: 13px;">${event.title}</p><p style="margin: 0; color: #94a3b8; font-size: 12px;">www.hanyanghars.com</p></td></tr></table></td></tr></table></body></html>`;

  return { subject, html, to: author.email };
};

export const sendDecisionEmail = async (
  author: User,
  submission: any,
  event: any,
  decision: 'accepted' | 'rejected',
  comments?: string
): Promise<void> => {
  const { subject, html, to } = buildDecisionEmail(author, submission, event, decision, comments);

  await transporter.sendMail({
    from: EMAIL_SENDER,
    to,
    subject,
    html,
  });
};
