"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { uploadToSupabase } from "./supabaseStorageUtils";
import { WarningDialog } from "./WarningDialog";

export type ImageUploadProps = {
  label: string;
  bucket: string;
  folder?: string;
  currentUrl?: string;
  required?: boolean;
  isLoading?: boolean;
  onUpload: (url: string) => void;
};

export function ImageUpload({
  label,
  bucket,
  folder,
  currentUrl,
  required = false,
  isLoading = false,
  onUpload,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl);
  const [warning, setWarning] = useState<string | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setWarning("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setWarning("File size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const url = await uploadToSupabase(file, bucket, folder ?? bucket);
      setPreviewUrl(url);
      onUpload(url);
    } catch (error) {
      console.error("Upload failed:", error);
      setWarning("Failed to upload image");
      setPreviewUrl(currentUrl);
    } finally {
      setIsUploading(false);
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
      <label className="text-sm font-medium">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-32 w-full max-w-[220px] overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Uploaded preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No image selected
            </div>
          )}
        </div>

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
          <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
        </div>
      </div>
    </div>
  );
}
