import { Resend } from "resend";
import PasswordResetEmail from "./email-templates/password-reset-email";
import { UserInvitationEmail } from "./email-templates/user-invitation";

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendUserInvitation(params: {
    email: string;
    verificationLink: string;
    companyName: string;
  }) {
    const { email, verificationLink, companyName } = params;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${companyName} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: email,
        subject: `Welcome to ${companyName}`,
        react: UserInvitationEmail({
          userEmail: email,
          verificationLink,
          companyName,
        }),
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, resetLink: string) {
    try {
      await this.resend.emails.send({
        from: `${process.env.NEXT_PUBLIC_COMPANY_NAME} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: email,
        subject: "Reset Your Password",
        react: PasswordResetEmail({ resetLink }),
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const emailService = new EmailService();
