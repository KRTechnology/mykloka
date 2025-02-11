import { Metadata } from "next";
import { LoginForm } from "./login-form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login | Kimberly Ryan",
  description: "Login to your account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const params = await searchParams;
  const from = params.from;

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
          <LoginForm from={from} />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Kimberly Ryan. All rights reserved.</p>
      </footer>
    </div>
  );
}
