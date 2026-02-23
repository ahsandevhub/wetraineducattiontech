import { createClient } from "@/app/utils/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * API route for secure image uploads
 * Uses service role (server-side) to bypass RLS issues
 * POST /api/upload
 *
 * Body (multipart/form-data):
 * - file: File object
 * - bucket: Storage bucket name (default: "avatars")
 * - folder: Folder path within bucket (default: "avatars")
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please log in" },
        { status: 401 },
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "avatars";
    const folder = (formData.get("folder") as string) || bucket;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const ext = file.name.split(".").pop();
    const filename = `${timestamp}-${random}.${ext}`;
    const filepath = folder ? `${folder}/${filename}` : filename;

    // Upload using service role (bypasses RLS)
    const supabase = getServiceSupabase();
    const buffer = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filepath, Buffer.from(buffer), {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 },
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filepath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
