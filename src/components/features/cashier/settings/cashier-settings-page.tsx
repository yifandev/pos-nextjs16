"use client";

import { useState, useEffect } from "react";
import {
  getCashierProfile,
  getCashierStats,
  CashierProfile,
} from "@/actions/cashier.actions";
import { ProfileCard } from "@/components/features/cashier/settings/profile-card";
import { CashierStatsCard } from "@/components/features/cashier/settings/cashier-stats-card";
import { SecuritySettingsCard } from "@/components/features/cashier/settings/security-settings-card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Edit2, Settings2, User } from "lucide-react";
import { toast } from "sonner";
import { ProfileEdit } from "./profile-edit";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CashierStatsData {
  totalSales: number;
  totalTransactions: number;
  accountAge: string;
  lastActive: Date | null;
}

/**
 * Cashier Settings Page Component
 * Displays user profile, statistics, and security settings
 */
export function CashierSettingsPage() {
  const [profile, setProfile] = useState<CashierProfile | null>(null);
  const [stats, setStats] = useState<CashierStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [profileResult, statsResult] = await Promise.allSettled([
          getCashierProfile(),
          getCashierStats(),
        ]);

        // Handle profile result
        if (
          profileResult.status === "fulfilled" &&
          profileResult.value.success
        ) {
          setProfile(profileResult.value.data || null);
        } else {
          const error =
            profileResult.status === "fulfilled"
              ? profileResult.value.error
              : "Failed to load profile";
          setError(error || "Failed to load profile");
        }

        // Handle stats result
        if (statsResult.status === "fulfilled" && statsResult.value.success) {
          setStats(statsResult.value.data || null);
        }
      } catch (err) {
        console.error("Error fetching cashier data:", err);
        setError("An unexpected error occurred");
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle profile save
  const handleProfileSaved = () => {
    setIsEditing(false);
    // Refresh profile data
    const fetchProfile = async () => {
      const result = await getCashierProfile();
      if (result.success && result.data) {
        setProfile(result.data);
      }
    };
    fetchProfile();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">
                Error Loading Profile
              </h3>
              <p className="text-sm text-muted-foreground">
                {error || "Failed to load profile. Please try again later."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 mt-10 mb-10">
      {/* Profile Section */}
      <div className="space-y-6">
        {/* Profile View/Edit Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing
                ? "Update your profile details"
                : "Your personal information and account details"}
            </p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {isEditing ? (
            <div className="lg:col-span-2">
              <ProfileEdit
                profile={profile}
                onSaved={handleProfileSaved}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <>
              <div className="lg:col-span-2">
                <ProfileCard profile={profile} />
              </div>

              {/* Quick Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <span className="text-primary">💡</span>
                    </div>
                    Profile Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-0.5">
                        <span className="text-primary font-bold">→</span>
                      </div>
                      <p className="text-sm">
                        Keep your profile information up to date for better
                        account management
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-0.5">
                        <span className="text-primary font-bold">→</span>
                      </div>
                      <p className="text-sm">
                        Add a profile picture to make your account more
                        recognizable to colleagues
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-0.5">
                        <span className="text-primary font-bold">→</span>
                      </div>
                      <p className="text-sm">
                        Your email is used for account recovery and important
                        notifications
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="mt-0.5">
                        <span className="text-primary font-bold">→</span>
                      </div>
                      <p className="text-sm">
                        Always verify your email to ensure maximum account
                        security
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Statistics Section */}
      {stats && !isEditing && (
        <>
          <Separator />
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Performance Overview</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your account activity and transaction statistics
              </p>
            </div>
            <CashierStatsCard
              totalSales={stats.totalSales}
              totalTransactions={stats.totalTransactions}
              accountAge={stats.accountAge}
              lastActive={stats.lastActive}
            />
          </div>
        </>
      )}

      {/* Security Section */}
      {!isEditing && (
        <>
          <Separator />
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Security Settings</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your password, 2FA, and security preferences
              </p>
            </div>
            <SecuritySettingsCard />
          </div>
        </>
      )}
    </div>
  );
}
