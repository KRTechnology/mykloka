import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { UserInvitationEmail } from "./email-templates/user-invitation";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendUserInvitation(params: {
    email: string;
    verificationLink: string;
    companyName: string;
  }) {
    const { email, verificationLink, companyName } = params;

    const emailHtml = await render(
      UserInvitationEmail({
        userEmail: email,
        verificationLink,
        companyName,
      })
    );

    await this.transporter.sendMail({
      from: `"${companyName}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Welcome to ${companyName}`,
      html: emailHtml,
    });
  }
}

// Create a singleton instance
export const emailService = new EmailService();
