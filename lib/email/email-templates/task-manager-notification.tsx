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

interface TaskManagerNotificationProps {
  taskTitle: string;
  taskDescription: string;
  subordinateName: string;
  taskLink: string;
  actionType: "created" | "completed";
  dueDate?: string;
}

export const TaskManagerNotification = ({
  taskTitle,
  taskDescription,
  subordinateName,
  taskLink,
  actionType,
  dueDate,
}: TaskManagerNotificationProps) => (
  <Html>
    <Head />
    <Preview>
      {actionType === "created"
        ? `New task created by ${subordinateName}`
        : `Task completed by ${subordinateName}`}
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
          {actionType === "created"
            ? "New Task Created"
            : "Task Marked as Completed"}
        </Heading>
        <Text style={text}>
          {actionType === "created"
            ? `${subordinateName} has created a new task that requires your attention.`
            : `${subordinateName} has marked a task as completed and is awaiting your approval.`}
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
        </Section>
        <Section style={buttonContainer}>
          <Button style={button} href={taskLink}>
            View Task
          </Button>
        </Section>
        <Text style={footer}>
          You can review and take action on this task by clicking the button
          above or by visiting the task directly in the dashboard.
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

export default TaskManagerNotification;
