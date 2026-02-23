import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Upload file to Supabase storage via API route
 * Uses server-side service role (bypasses RLS issues)
 * @param file - File to upload
 * @param bucket - Storage bucket name
 * @param folder - Optional folder path within bucket
 * @returns Public URL of uploaded file
 */
export async function uploadToSupabase(
  file: File,
  bucket: string = "avatars",
  folder: string = "avatars",
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
}

/**
 * Delete file from Supabase storage
 */
export async function deleteFromSupabase(
  filepath: string,
  bucket: string = "avatars",
): Promise<void> {
  const supabase = getServiceSupabase();

  const { error } = await supabase.storage.from(bucket).remove([filepath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
