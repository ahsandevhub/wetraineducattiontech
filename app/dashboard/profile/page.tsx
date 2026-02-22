"use client";

import { createClient } from "@/app/utils/supabase/client";
import { ProfilePageLoadingSkeleton } from "@/components/shared/PageLoadingSkeletons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  avatar_url: string | null;
}

const COUNTRIES = [
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("You are not authenticated. Redirecting to login...");
          setTimeout(() => router.push("/login"), 1500);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Only treat as error if there's an actual error with a message or code
        if (fetchError && (fetchError.message || fetchError.code)) {
          if (fetchError.code === "PGRST116") {
            setError("Profile not found. Please complete your registration.");
            return;
          }
          // Only throw if it's a real error (not an empty object)
          if (fetchError.message) {
            throw fetchError;
          }
        }

        if (!data || Object.keys(data).length === 0) {
          setError("Failed to load profile data.");
          return;
        }

        // Ensure all required fields have default values
        const profileData = {
          ...data,
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          postal_code: data.postal_code || null,
          country: data.country || null,
          avatar_url: data.avatar_url || null,
        };

        setProfile(profileData);
        setOriginalProfile(profileData);
      } catch (error) {
        // Ignore empty error objects
        if (
          error &&
          typeof error === "object" &&
          Object.keys(error).length === 0
        ) {
          console.warn("Empty error object caught and ignored");
          setLoading(false);
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.";
        console.error("Error fetching profile:", error);
        setError(errorMessage);
        toast.error(`✗ ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, router]);

  const hasChanges =
    originalProfile &&
    profile &&
    ((profile.full_name || "") !== (originalProfile.full_name || "") ||
      (profile.phone || "") !== (originalProfile.phone || "") ||
      (profile.address || "") !== (originalProfile.address || "") ||
      (profile.city || "") !== (originalProfile.city || "") ||
      (profile.state || "") !== (originalProfile.state || "") ||
      (profile.postal_code || "") !== (originalProfile.postal_code || "") ||
      (profile.country || "") !== (originalProfile.country || ""));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile || !hasChanges) return;

    // Validate full name
    const fullName = (profile.full_name || "").trim();
    if (!fullName || fullName.length === 0) {
      toast.error("✗ Full name is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: profile.phone?.trim() || null,
          address: profile.address?.trim() || null,
          city: profile.city?.trim() || null,
          state: profile.state?.trim() || null,
          postal_code: profile.postal_code?.trim() || null,
          country: profile.country || null,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Update with trimmed values
      const updatedProfile = {
        ...profile,
        full_name: fullName,
        phone: profile.phone?.trim() || null,
        address: profile.address?.trim() || null,
        city: profile.city?.trim() || null,
        state: profile.state?.trim() || null,
        postal_code: profile.postal_code?.trim() || null,
      };
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      toast.success("✓ Profile updated successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      console.error("Error updating profile:", error);
      setError(`Failed to save changes: ${errorMessage}`);
      toast.error(`✗ ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !profile) return;

    const file = e.target.files[0];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    // Validate file size
    if (file.size > MAX_SIZE) {
      toast.error("✗ File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("✗ Please select a valid image file");
      return;
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt || "")) {
      toast.error("✗ Only JPG, PNG, GIF, or WebP files are allowed");
      return;
    }

    const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setUploading(true);
    setError(null);
    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      const updatedProfile = { ...profile, avatar_url: publicUrl };
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      toast.success("✓ Avatar updated successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload avatar";
      console.error("Error uploading avatar:", error);
      setError(`Failed to upload avatar: ${errorMessage}`);
      toast.error(`✗ ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <ProfilePageLoadingSkeleton />;
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">{error}</p>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Profile Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Unable to load profile data.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials =
    (profile.full_name || "")
      .split(" ")
      .map((n) => n?.[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="container max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your profile information
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                <div className="flex items-start gap-3">
                  <span className="text-lg leading-none">⚠️</span>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={profile.avatar_url || undefined}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <AvatarFallback className="bg-primary-yellow text-white text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload Photo"}
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  JPG, PNG or GIF, max 5MB
                </p>
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                type="text"
                value={profile.full_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="+880 1234-567890"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address Information</h3>

              {/* Street Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  type="text"
                  value={profile.address || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                  placeholder="Street address, apartment, suite, etc."
                />
              </div>

              {/* City and State in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={profile.city || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, city: e.target.value })
                    }
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    type="text"
                    value={profile.state || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, state: e.target.value })
                    }
                    placeholder="State or Province"
                  />
                </div>
              </div>

              {/* Postal Code and Country in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    type="text"
                    value={profile.postal_code || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, postal_code: e.target.value })
                    }
                    placeholder="Postal/ZIP code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={profile.country || ""}
                    onValueChange={(value) =>
                      setProfile({ ...profile, country: value })
                    }
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country">
                        {profile.country && (
                          <div className="flex items-center gap-2">
                            <Image
                              src={`https://flagcdn.com/w20/${profile.country.toLowerCase()}.png`}
                              alt={profile.country}
                              width={20}
                              height={15}
                              className="rounded-sm"
                            />
                            <span>
                              {COUNTRIES.find((c) => c.code === profile.country)
                                ?.name || profile.country}
                            </span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                              alt={country.name}
                              width={20}
                              height={15}
                              className="rounded-sm"
                              unoptimized
                            />
                            <span>{country.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving || !hasChanges}
                className={!hasChanges ? "opacity-50 cursor-not-allowed" : ""}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
