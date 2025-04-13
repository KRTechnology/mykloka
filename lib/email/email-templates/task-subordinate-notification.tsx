import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TaskSubordinateNotificationProps {
  taskTitle: string;
  taskDescription: string;
  managerName: string;
  taskLink: string;
  actionType: "in_progress" | "approved" | "rejected";
  dueDate?: string;
  rejectionReason?: string;
}

export const TaskSubordinateNotification = ({
  taskTitle,
  taskDescription,
  managerName,
  taskLink,
  actionType,
  dueDate,
  rejectionReason,
}: TaskSubordinateNotificationProps) => (
  <Html>
    <Head />
    <Preview>
      {actionType === "in_progress"
        ? `Task approved to start by ${managerName}`
        : actionType === "approved"
          ? `Task approved by ${managerName}`
          : `Task rejected by ${managerName}`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${process.env.NEXT_PUBLIC_APP_URL}/images/kr_logo_and_tagline.png`}
          alt="Kimberly Ryan"
          width={200}
          height={50}
          style={logo}
        />
        <Heading style={h1}>
          {actionType === "in_progress"
            ? "Task Approved to Start"
            : actionType === "approved"
              ? "Task Approved"
              : "Task Rejected"}
        </Heading>
        <Text style={text}>
          {actionType === "in_progress"
            ? `${managerName} has approved your task to start. You can now begin working on it.`
            : actionType === "approved"
              ? `${managerName} has approved your completed task. Great job!`
              : `${managerName} has reviewed your task and provided feedback.`}
        </Text>
        <Section style={taskDetails}>
          <Text style={taskTitleStyle}>{taskTitle}</Text>
          {taskDescription && (
            <Text style={taskDescriptionStyle}>{taskDescription}</Text>
          )}
          {dueDate && (
            <Text style={dueDateStyle}>
              Due Date: {new Date(dueDate).toLocaleDateString()}
            </Text>
          )}
          {actionType === "rejected" && rejectionReason && (
            <Section style={rejectionSection}>
              <Text style={rejectionTitle}>Rejection Reason:</Text>
              <Text style={rejectionReasonStyle}>{rejectionReason}</Text>
            </Section>
          )}
        </Section>
        <Section style={buttonContainer}>
          <Button style={button} href={taskLink}>
            View Task
          </Button>
        </Section>
        <Text style={footer}>
          {actionType === "in_progress"
            ? "You can start working on this task by clicking the button above."
            : actionType === "approved"
              ? "This task has been successfully completed and approved."
              : "Please review the feedback and make the necessary adjustments to your task."}
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  width: "580px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const logo = {
  margin: "0 auto 20px",
  display: "block",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "30px 0",
  padding: "0",
  lineHeight: "1.5",
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const taskDetails = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "20px",
  margin: "20px 0",
};

const taskTitleStyle = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 10px 0",
};

const taskDescriptionStyle = {
  color: "#4a4a4a",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "10px 0",
};

const dueDateStyle = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "10px 0 0 0",
};

const rejectionSection = {
  backgroundColor: "#fef2f2",
  borderRadius: "6px",
  padding: "15px",
  margin: "15px 0 0 0",
};

const rejectionTitle = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 5px 0",
};

const rejectionReasonStyle = {
  color: "#4a4a4a",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "5px 0 0 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#ff6b00",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  border: "none",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "40px 0 0",
};

export default TaskSubordinateNotification;
