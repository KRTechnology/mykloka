import { SignInForm } from "@/components/auth/sign-in-form";
import { getSession } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to Kloka</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
