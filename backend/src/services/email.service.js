import nodemailer from "nodemailer";
import { ENV } from "../config/env.js";
import { logger } from "../utils/logger.js";

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (ENV.isDevelopment) {
      // In development, use console logging instead of sending emails
      this.transporter = {
        sendMail: async (mailOptions) => {
          logger.info(
            {
              to: mailOptions.to,
              subject: mailOptions.subject,
              text: mailOptions.text,
              html: mailOptions.html,
            },
            "DEV MODE: Email not sent, logged instead"
          );
          return { messageId: "dev-mode-message-id" };
        },
      };
    } else {
      // In production, use actual SMTP transporter
      this.transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_PORT === 465,
        auth: {
          user: ENV.SMTP_USER,
          pass: ENV.SMTP_PASSWORD,
        },
      });
    }
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${ENV.CORS_ORIGIN}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: ENV.EMAIL_FROM,
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #999; font-size: 14px; margin-top: 24px;">This link will expire in 1 hour.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(
        { messageId: info.messageId, to: email },
        "Password reset email sent"
      );
      return info;
    } catch (error) {
      logger.error(
        { err: error, to: email },
        "Failed to send password reset email"
      );
      throw error;
    }
  }

  async sendWelcomeEmail(email, username) {
    const mailOptions = {
      from: ENV.EMAIL_FROM,
      to: email,
      subject: "Welcome to Our Application",
      text: `Welcome ${username}! Your account has been successfully created.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${username}!</h2>
          <p>Your account has been successfully created.</p>
          <p>You can now log in and start using our application.</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(
        { messageId: info.messageId, to: email },
        "Welcome email sent"
      );
      return info;
    } catch (error) {
      logger.error({ err: error, to: email }, "Failed to send welcome email");
      // Don't throw error for welcome email, just log it
    }
  }
}

export const emailService = new EmailService();
export default emailService;
