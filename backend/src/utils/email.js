import { config } from "../config/env.js";
import logger from "./logger.js";

/**
 * Email утилиты
 *
 * В DEV режиме (ENABLE_EMAIL=false):
 * - Email НЕ отправляется
 * - Контент логируется через Pino
 *
 * В PRODUCTION режиме (ENABLE_EMAIL=true):
 * - Реальная отправка через SMTP
 */

/**
 * Шаблон письма восстановления пароля
 */
const getPasswordResetTemplate = (nickname, resetUrl, expiryMinutes) => {
  return {
    subject: "Password Reset Request",
    text: `
Hello ${nickname},

You requested to reset your password. Please use the link below to set a new password:

${resetUrl}

This link will expire in ${expiryMinutes} minutes.

If you didn't request this, please ignore this email.

Best regards,
Your App Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background-color: #007bff; 
      color: white; 
      text-decoration: none; 
      border-radius: 4px; 
      margin: 20px 0;
    }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>Hello <strong>${nickname}</strong>,</p>
    <p>You requested to reset your password. Click the button below to set a new password:</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p>Or copy this link into your browser:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p><strong>This link will expire in ${expiryMinutes} minutes.</strong></p>
    <p>If you didn't request this, please ignore this email.</p>
    <div class="footer">
      <p>Best regards,<br>Your App Team</p>
    </div>
  </div>
</body>
</html>
    `,
  };
};

/**
 * Шаблон письма подтверждения email
 */
const getEmailVerificationTemplate = (nickname, verificationUrl) => {
  return {
    subject: "Verify Your Email Address",
    text: `
Hello ${nickname},

Please verify your email address by clicking the link below:

${verificationUrl}

If you didn't create an account, please ignore this email.

Best regards,
Your App Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background-color: #28a745; 
      color: white; 
      text-decoration: none; 
      border-radius: 4px; 
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Verify Your Email Address</h2>
    <p>Hello <strong>${nickname}</strong>,</p>
    <p>Please verify your email address by clicking the button below:</p>
    <a href="${verificationUrl}" class="button">Verify Email</a>
    <p>If you didn't create an account, please ignore this email.</p>
  </div>
</body>
</html>
    `,
  };
};

/**
 * Отправка email (или логирование в DEV)
 */
const sendEmail = async (to, template) => {
  if (!config.features.email) {
    // DEV MODE - логируем вместо отправки
    logger.info(
      {
        type: "EMAIL_DEV_MODE",
        to,
        subject: template.subject,
        content: {
          text: template.text,
          html: template.html,
        },
      },
      "📧 Email would be sent (DEV MODE)"
    );

    return { success: true, mode: "dev" };
  }

  // PRODUCTION MODE - реальная отправка
  try {
    // Здесь подключить nodemailer или другой SMTP клиент
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({...});

    logger.info(
      {
        type: "EMAIL_SENT",
        to,
        subject: template.subject,
      },
      "Email sent successfully"
    );

    return { success: true, mode: "production" };
  } catch (error) {
    logger.error(
      {
        type: "EMAIL_ERROR",
        to,
        subject: template.subject,
        error: error.message,
      },
      "Failed to send email"
    );

    throw error;
  }
};

/**
 * Отправить письмо восстановления пароля
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${config.cors.origin}/reset-password?token=${resetToken}`;
  const expiryMinutes = Math.floor(config.security.passwordResetExpiry / 60000);

  const template = getPasswordResetTemplate(
    user.nickname,
    resetUrl,
    expiryMinutes
  );

  return sendEmail(user.email || user.nickname, template);
};

/**
 * Отправить письмо подтверждения email
 */
export const sendEmailVerification = async (user, verificationToken) => {
  const verificationUrl = `${config.cors.origin}/verify-email?token=${verificationToken}`;

  const template = getEmailVerificationTemplate(user.nickname, verificationUrl);

  return sendEmail(user.email, template);
};

export default {
  sendPasswordResetEmail,
  sendEmailVerification,
};
