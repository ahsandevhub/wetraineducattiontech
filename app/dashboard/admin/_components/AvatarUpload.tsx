"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { uploadToSupabase } from "./supabaseStorageUtils";
import { WarningDialog } from "./WarningDialog";

export interface AvatarUploadProps {
  currentAvatarUrl?: string;
  fallback?: string;
  onUpload: (url: string) => void;
  isLoading?: boolean;
}

export function AvatarUpload({
  currentAvatarUrl,
  fallback = "U",
  onUpload,
  isLoading = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    currentAvatarUrl,
  );
  const [warning, setWarning] = useState<string | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setWarning("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setWarning("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const url = await uploadToSupabase(file, "avatars", "avatars");
      onUpload(url);
    } catch (error) {
      console.error("Upload failed:", error);
      setWarning("Failed to upload image");
      // Reset preview on error
      setPreviewUrl(currentAvatarUrl);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    setPreviewUrl(undefined);
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <WarningDialog
        open={Boolean(warning)}
        description={warning ?? ""}
        onClose={() => setWarning(null)}
      />
      <label className="text-sm font-medium">Profile Picture</label>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={previewUrl} alt="Avatar preview" />
          <AvatarFallback className="bg-blue-100 text-blue-900">
            {fallback.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading || isLoading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isUploading || isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">JPG, PNG or GIF (max. 5MB)</p>
    </div>
  );
}
