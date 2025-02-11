import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { VerifyForm } from "./verify-form";

export const metadata: Metadata = {
  title: "Verify Account | Kimberly Ryan",
  description: "Complete your account setup",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
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
          <VerifyForm token={token} />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Kimberly Ryan. All rights reserved.</p>
      </footer>
    </div>
  );
}
