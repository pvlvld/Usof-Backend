import nodemailer from "nodemailer";
import { EMAIL_TEMPLATES } from "../consts/emailTemplates.js";

class EmailService {
  private static instance: EmailService | null = null;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.example.com",
      port: 587,
      auth: {
        user: "user@example.com",
        pass: "password"
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
      from: "no-reply@example.com",
      to: email,
      subject: "Password Reset",
      html: EMAIL_TEMPLATES.resetPassword(this.getEmailResetLink(token))
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending password reset email:", error);
    }
  }

  public async sendEmailVerification(email: string, token: string) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: "no-reply@example.com",
      to: email,
      subject: "Email Verification",
      html: EMAIL_TEMPLATES.emailConfirmation(
        this.getEmailVerificationLink(token)
      )
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email verification:", error);
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
