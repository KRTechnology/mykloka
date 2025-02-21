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
    <Preview>Welcome to {companyName} - Complete your account setup</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${process.env.NEXT_PUBLIC_APP_URL}/images/kr_logo_and_tagline.png`}
          alt={companyName}
          width={200}
          height={50}
          style={logo}
        />
        <Heading style={h1}>Welcome to {companyName}!</Heading>
        <Text style={text}>
          You have been invited to join {companyName}. To get started, click the
          button below to set up your account.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={verificationLink}>
            Set Up Account
          </Button>
        </Section>
        <Text style={text}>
          This invitation was sent to {userEmail}. If you did not expect this
          invitation, you can safely ignore this email.
        </Text>
        <Text style={text}>
          Or copy and paste this URL into your browser:{" "}
          <Link href={verificationLink} style={link}>
            {verificationLink}
          </Link>
        </Text>
        <Text style={footer}>
          If you have any questions, please don't hesitate to contact our
          support team.
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

const link = {
  color: "#ff6b00",
  textDecoration: "none",
  fontSize: "14px",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "center" as const,
  margin: "40px 0 0",
};

export default UserInvitationEmail;
