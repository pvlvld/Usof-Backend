import nodemailer from "nodemailer";
import { EMAIL_TEMPLATES } from "../consts/emailTemplates.js";
import { InternalServerError } from "../consts/errors.js";

class EmailService {
  private static instance: EmailService | null = null;
  private transporter: nodemailer.Transporter;
  private senderEmail: string;
  private constructor() {
    this.senderEmail = process.env.SMTP_USER || "user@example.com";
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      auth: {
        user: this.senderEmail,
        pass: process.env.SMTP_PASS || "password"
      }
    });
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new EmailService();
    }
    return this.instance;
  }

  public async sendPasswordResetEmail(email: string, token: string) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.senderEmail,
      to: email,
      subject: "Password Reset",
      html: EMAIL_TEMPLATES.resetPassword(this.getEmailResetLink(token))
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerError("Failed to send password reset email");
    }
  }

  public async sendEmailVerification(email: string, token: string) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.senderEmail,
      to: email,
      subject: "Email Verification",
      html: EMAIL_TEMPLATES.emailConfirmation(
        this.getEmailVerificationLink(token)
      )
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerError("Failed to send email verification");
    }
  }

  private getEmailResetLink(token: string) {
    return `https://example.com/auth/password-reset/${token}`;
  }

  private getEmailVerificationLink(token: string) {
    return `https://example.com/auth/verify-email/${token}`;
  }
}

export { EmailService };
