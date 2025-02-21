import { Metadata } from "next";
import Image from "next/image";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | Kimberly Ryan",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col mx-auto w-full max-w-[400px] px-4">
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full space-y-8">
          <div className="flex flex-col items-center">
            <Image
              src="/images/kr_logo_and_tagline.png"
              alt="Kimberly Ryan"
              width={200}
              height={50}
              priority
              className="w-auto h-auto"
            />
          </div>
          <ForgotPasswordForm />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Kimberly Ryan. All rights reserved.</p>
      </footer>
    </div>
  );
}
