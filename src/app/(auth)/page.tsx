import { LoginForm } from "@/components/login-form";
import { getRoleRedirectUrl, getServerSession } from "@/hooks/auth-helpers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Auth() {
  const session = await getServerSession();

  // Jika sudah login, redirect ke dashboard sesuai role
  if (session) {
    const redirectUrl = getRoleRedirectUrl(session.user.role);
    redirect(redirectUrl);
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
