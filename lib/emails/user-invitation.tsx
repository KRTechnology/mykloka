import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface UserInvitationEmailProps {
  userEmail: string;
  verificationLink: string;
  companyName: string;
}

export const UserInvitationEmail = ({
  userEmail,
  verificationLink,
  companyName,
}: UserInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to {companyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to {companyName}</Heading>
        <Text style={text}>
          You have been invited to join {companyName}. Click the button below to
          set up your account.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={verificationLink}>
            Set Up Account
          </Button>
        </Section>
        <Text style={text}>
          Or copy and paste this URL into your browser:{" "}
          <Link href={verificationLink} style={link}>
            {verificationLink}
          </Link>
        </Text>
        <Text style={footer}>
          If you did not request this invitation, please ignore this email.
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
  padding: "20px 0 48px",
  width: "560px",
};

const h1 = {
  color: "#000",
  fontSize: "24px",
  fontWeight: "normal",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 30px",
  cursor: "pointer",
};

const link = {
  color: "#067df7",
  textDecoration: "none",
};

const footer = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "24px",
};

export default UserInvitationEmail;
