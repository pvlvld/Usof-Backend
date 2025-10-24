import nodemailer from "nodemailer";
import { EMAIL_TEMPLATES } from "../consts/emailTemplates.js";
import { InternalServerError } from "../consts/errors.js";
import { google } from "googleapis";

class EmailService {
  private static instance: EmailService | null = null;
  private static initialized: boolean = false;
  private transporter!: nodemailer.Transporter;
  private sender: string;
  private constructor() {
    const senderEmail = process.env.SMTP_EMAIL || "user@example.com";
    this.sender = `"Usof" <${senderEmail}>`;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new EmailService();
    }
    return this.instance;
  }

  // SHITCODE ALERT
  public static async initialize() {
    if (!this.instance) {
      this.instance = new EmailService();
    }

    if (this.initialized) {
      return;
    }

    const OAuth2 = google.auth.OAuth2;

    const createTransporter = async () => {
      const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN!
      });

      const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            reject("Failed to create access token :(");
          }
          resolve(token);
        });
      });

      this.instance!.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.SMTP_EMAIL,
          clientId: process.env.SMTP_CLIENT_ID,
          clientSecret: process.env.SMTP_CLIENT_SECRET,
          refreshToken: process.env.SMTP_REFRESH_TOKEN,
          accessToken: accessToken as string
        }
      });
    };

    this.initialized = true;
  }

  public async sendPasswordResetEmail(email: string, token: string) {
    if (!this.transporter) {
      throw new InternalServerError("Email service not initialized");
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.sender,
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
    if (!this.transporter) {
      throw new InternalServerError("Email service not initialized");
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.sender,
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
