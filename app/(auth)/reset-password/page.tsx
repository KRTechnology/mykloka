import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Kimberly Ryan",
  description: "Create a new password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const pageParams = await searchParams;

  if (!pageParams.token) {
    redirect("/login");
  }

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
          <ResetPasswordForm token={pageParams.token} />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Kimberly Ryan. All rights reserved.</p>
      </footer>
    </div>
  );
}
