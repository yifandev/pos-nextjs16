"use client";

import { useState, useTransition } from "react";
import {
  CashierProfile,
  updateCashierProfile,
} from "@/actions/cashier.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User, Save, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Validation schema
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  image: z.string().url("Must be a valid URL").nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditProps {
  profile: CashierProfile;
  onSaved?: () => void;
  onCancel?: () => void;
}

/**
 * Profile edit component
 * Allows users to edit their name and profile picture
 */
export function ProfileEdit({ profile, onSaved, onCancel }: ProfileEditProps) {
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(
    profile.image || null
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name || "",
      image: profile.image || "",
    },
  });

  // Handle form submission
  const onSubmit = (values: ProfileFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateCashierProfile({
          name: values.name,
          image: values.image || undefined,
        });

        if (result.success) {
          toast.success("Profile updated successfully");
          onSaved?.();
        } else {
          toast.error(result.error || "Failed to update profile");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Profile update error:", error);
      }
    });
  };

  // Generate avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle image URL change
  const handleImageChange = (url: string) => {
    form.setValue("image", url);
    setImagePreview(url);
  };

  // Clear image
  const clearImage = () => {
    form.setValue("image", "");
    setImagePreview(null);
  };

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information and settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <Label className="text-base font-semibold">
                  Profile Picture
                </Label>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-lg border bg-card">
                <div className="shrink-0">
                  <Avatar className="h-24 w-24 ring-2 ring-primary/10">
                    <AvatarImage src={imagePreview || ""} alt={profile.name} />
                    <AvatarFallback className="text-lg font-semibold bg-linear-to-br from-primary/20 to-primary/30 text-primary">
                      {getInitials(profile.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                placeholder="https://example.com/profile.jpg"
                                value={field.value || ""}
                                onChange={(e) =>
                                  handleImageChange(e.target.value)
                                }
                                disabled={isPending}
                                className="text-sm"
                              />
                              <FormDescription className="text-xs">
                                Enter a direct URL to an image (JPG, PNG, GIF,
                                etc.)
                              </FormDescription>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {imagePreview && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={clearImage}
                        disabled={isPending}
                        className="gap-2"
                      >
                        <X className="h-3 w-3" />
                        Remove Picture
                      </Button>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Recommended size: 400x400px • Max 2MB
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Name Field */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <Label className="text-base font-semibold">
                  Personal Information
                </Label>
              </div>

              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          disabled={isPending}
                          className="h-11"
                        />
                      </FormControl>
                      <FormDescription>
                        Your name as it appears in the system and to colleagues
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <FormLabel>Email Address</FormLabel>
                  <div className="relative">
                    <Input
                      type="email"
                      value={profile.email || ""}
                      disabled
                      className="h-11 bg-muted/50 text-muted-foreground cursor-not-allowed pr-10"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        Read Only
                      </span>
                    </div>
                  </div>
                  <FormDescription className="text-xs">
                    Email address cannot be changed for security reasons
                  </FormDescription>
                </div>
              </div>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
              <AlertDescription className="text-sm">
                Changes to your profile will be visible immediately to other
                users in the system.
              </AlertDescription>
            </Alert>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
                className="flex-1 gap-2 h-11"
              >
                {isPending ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
                className="flex-1 gap-2 h-11"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
