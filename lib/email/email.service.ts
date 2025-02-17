import { Resend } from "resend";
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
      // You might want to handle this error according to your needs
      console.error("Failed to send email:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const emailService = new EmailService();
