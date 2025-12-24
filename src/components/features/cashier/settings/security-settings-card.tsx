"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, LogOut, Shield, AlertCircle } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient, signOut } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

/**
 * Security and settings card component
 * Manages security-related actions and account settings
 */
export function SecuritySettingsCard() {
  const [isPending, startTransition] = useTransition();

  // Handle logout
  const handleLogout = () => {
    startTransition(async () => {
      try {
        await authClient.signOut();
        toast.success("Logout Berhasil");
      } catch (error) {
        toast.error("Failed to logout");
      }
    });
  };

  // Handle password reset request
  const handlePasswordReset = () => {
    toast.info("Password reset feature coming soon");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security & Settings
        </CardTitle>
        <CardDescription>
          Manage your account security and preferences
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Security Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </h3>
            <div className="space-y-3">
              {/* Password Reset */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-muted">
                <div>
                  <p className="text-sm font-medium">Change Password</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Update your account password regularly
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePasswordReset}
                  disabled={isPending}
                >
                  Update
                </Button>
              </div>

              {/* Session Security */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-muted">
                <div>
                  <p className="text-sm font-medium">Session Timeout</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto logout after 30 minutes of inactivity
                  </p>
                </div>
                <Badge variant="secondary">Auto</Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Session Management Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Session Management
            </h3>
            <div className="space-y-3">
              {/* Current Session */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-muted">
                <div>
                  <p className="text-sm font-medium">Current Session</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This device is currently logged in
                  </p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              {/* Logout Button */}
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout from this Device
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
          <div className="flex gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                Important
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                Keep your credentials safe. Never share your password or session
                information with anyone.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
