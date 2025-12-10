"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

/**
 * OTP verification form component
 * Verifies the code sent to user's email
 */
export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem("otp_email");
    if (!storedEmail) {
      toast.error("No email found. Please start from login page.");
      router.push("/");
      return;
    }
    setEmail(storedEmail);

    // Start countdown for resend button
    setCountdown(60);
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      // PERBAIKAN: Gunakan method checkVerificationOtp untuk verifikasi
      const response = await authClient.signIn.emailOtp({
        email,
        otp,
      });

      if (response.error) {
        toast.error(response.error.message || "Invalid verification code");
        setOtp("");
        return;
      }

      // Clear stored email
      sessionStorage.removeItem("otp_email");

      toast.success("Login successful!");

      // Get user session to determine role
      const session = await authClient.getSession();

      if (session.data?.user) {
        // Type assertion untuk user dengan role
        type UserWithRole = typeof session.data.user & {
          role?: string;
        };

        const user = session.data.user as UserWithRole;
        const userRole = user.role?.toLowerCase();

        // Redirect based on role
        if (userRole === "admin") {
          router.push("/admin");
        } else if (userRole === "cashier") {
          router.push("/cashier");
        } else {
          // Default to cashier if no role set
          router.push("/cashier");
        }
      } else {
        router.push("/cashier");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("An error occurred. Please try again.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);

    try {
      const response = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (response.error) {
        toast.error(response.error.message || "Failed to resend code");
        return;
      }

      toast.success("New verification code sent!");
      setCountdown(60);
      setOtp("");
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    sessionStorage.removeItem("otp_email");
    router.push("/");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleVerify}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-16 items-center justify-center rounded-md">
              <Image
                src="/iconcoffe.png"
                alt="POS Coffee Shop"
                width={64}
                height={64}
                priority
              />
            </div>
            <h1 className="text-xl font-bold">Enter Verification Code</h1>
            <FieldDescription>
              We sent a 6-digit code to <strong>{email}</strong>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="otp" className="sr-only">
              Verification code
            </FieldLabel>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                id="otp"
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
                required
                containerClassName="gap-4"
              >
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <FieldDescription className="text-center">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResending
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend"}
              </button>
            </FieldDescription>
          </Field>
          <Field className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center text-xs">
        By continuing, you agree to our{" "}
        <a href="#" className="underline hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-primary">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
