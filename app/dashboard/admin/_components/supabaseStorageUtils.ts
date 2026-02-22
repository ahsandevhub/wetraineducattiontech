import { createClient } from "@/app/utils/supabase/client";

/**
 * Upload file to Supabase storage
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
  const supabase = await createClient();

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const ext = file.name.split(".").pop();
  const filename = `${timestamp}-${random}.${ext}`;
  const filepath = folder ? `${folder}/${filename}` : filename;

  // Upload file
  const { error } = await supabase.storage.from(bucket).upload(filepath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filepath);

  return urlData.publicUrl;
}

/**
 * Delete file from Supabase storage
 */
export async function deleteFromSupabase(
  filepath: string,
  bucket: string = "avatars",
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(bucket).remove([filepath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
