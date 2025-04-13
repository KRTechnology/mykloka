import { Resend } from "resend";
import PasswordResetEmail from "./email-templates/password-reset-email";
import { UserInvitationEmail } from "./email-templates/user-invitation";
import { TaskManagerNotification } from "./email-templates/task-manager-notification";
import { TaskSubordinateNotification } from "./email-templates/task-subordinate-notification";

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

  async sendTaskManagerNotification(params: {
    managerEmail: string;
    taskTitle: string;
    taskDescription: string;
    subordinateName: string;
    taskLink: string;
    actionType: "created" | "completed";
    dueDate?: string;
  }) {
    const {
      managerEmail,
      taskTitle,
      taskDescription,
      subordinateName,
      taskLink,
      actionType,
      dueDate,
    } = params;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${process.env.NEXT_PUBLIC_COMPANY_NAME} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: managerEmail,
        subject:
          actionType === "created"
            ? `New Task Created by ${subordinateName}`
            : `Task Completed by ${subordinateName}`,
        react: TaskManagerNotification({
          taskTitle,
          taskDescription,
          subordinateName,
          taskLink,
          actionType,
          dueDate,
        }),
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Failed to send task manager notification:", error);
      throw error;
    }
  }

  async sendTaskSubordinateNotification(params: {
    subordinateEmail: string;
    taskTitle: string;
    taskDescription: string;
    managerName: string;
    taskLink: string;
    actionType: "in_progress" | "approved" | "rejected";
    dueDate?: string;
    rejectionReason?: string;
  }) {
    const {
      subordinateEmail,
      taskTitle,
      taskDescription,
      managerName,
      taskLink,
      actionType,
      dueDate,
      rejectionReason,
    } = params;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `${process.env.NEXT_PUBLIC_COMPANY_NAME} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: subordinateEmail,
        subject:
          actionType === "in_progress"
            ? `Task Approved to Start by ${managerName}`
            : actionType === "approved"
              ? `Task Approved by ${managerName}`
              : `Task Rejected by ${managerName}`,
        react: TaskSubordinateNotification({
          taskTitle,
          taskDescription,
          managerName,
          taskLink,
          actionType,
          dueDate,
          rejectionReason,
        }),
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Failed to send task subordinate notification:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const emailService = new EmailService();
