"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CashierProfile } from "@/actions/cashier.actions";
import { Mail, Calendar, Shield, Clock, User as UserIcon } from "lucide-react";

interface ProfileCardProps {
  profile: CashierProfile;
  isEditing?: boolean;
}

/**
 * Profile display component
 * Shows user information in a modern card layout
 */
export function ProfileCard({ profile, isEditing = false }: ProfileCardProps) {
  // Generate avatar fallback from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card
      className={`transition-all ${isEditing ? "ring-2 ring-primary" : ""}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.image || ""} alt={profile.name} />
              <AvatarFallback className="text-lg font-semibold bg-linear-to-br from-primary/50 to-primary/80 text-primary-foreground">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl mb-1">{profile.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {profile.email}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={profile.emailVerified ? "default" : "secondary"}
              className="h-fit"
            >
              {profile.emailVerified ? "Verified" : "Unverified"}
            </Badge>
            <Badge
              variant={profile.role === "admin" ? "destructive" : "default"}
              className="h-fit"
            >
              {profile.role
                ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                : "User"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4">
          {/* Account Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* User ID */}
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <UserIcon className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">
                    User ID
                  </p>
                  <p className="text-sm font-mono text-foreground truncate">
                    {profile.id}
                  </p>
                </div>
              </div>

              {/* Email Verification */}
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Shield className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">
                    Email Status
                  </p>
                  <p className="text-sm text-foreground">
                    {profile.emailVerified
                      ? "Verified"
                      : "Pending verification"}
                  </p>
                </div>
              </div>

              {/* Account Created */}
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">
                    Account Created
                  </p>
                  <p className="text-sm text-foreground">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Clock className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">
                    Last Updated
                  </p>
                  <p className="text-sm text-foreground">
                    {formatDate(profile.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          {profile.banned && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm font-medium text-destructive">
                Account Suspended
              </p>
              <p className="text-xs text-destructive/80 mt-1">
                This account has been temporarily suspended. Please contact
                support for more information.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
