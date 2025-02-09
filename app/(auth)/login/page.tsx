import { Metadata } from "next";
import { LoginForm } from "./login-form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login | Kimberly Ryan",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col mx-auto w-full max-w-[400px] px-4">
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full space-y-8">
          <div className="flex flex-col items-center">
            <Image
              src="/images/kr-logo-and-tagline.png"
              alt="Kimberly Ryan"
              width={300}
              height={120}
              priority
              className="mb-8"
            />
          </div>
          <LoginForm />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Kimberly Ryan. All rights reserved.</p>
      </footer>
    </div>
  );
}
