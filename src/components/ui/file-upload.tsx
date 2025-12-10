"use client";

import * as React from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  folder?: string;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  folder = "pos-system",
  className,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(value || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary via API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data?.url) {
        onChange(result.data.url);
      } else {
        alert(result.error || "Upload failed");
        setPreview(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
      setPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (value && onRemove) {
      try {
        // Delete from Cloudinary
        await fetch(`/api/upload?url=${encodeURIComponent(value)}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Delete error:", error);
      }
    }

    setPreview(null);
    onChange("");
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border bg-muted">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="128px"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="outline"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
              asChild
            >
              <span>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {preview ? "Change Image" : "Upload Image"}
                  </>
                )}
              </span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground">
            Max size: 5MB. Supported formats: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>
    </div>
  );
}
