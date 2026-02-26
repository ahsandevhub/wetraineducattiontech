"use client";

import { createClient } from "@/app/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserProfile {
  email: string;
  full_name: string;
  avatar_url: string | null;
}

export function ProfileMenu() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("email, full_name, avatar_url")
            .eq("id", user.id)
            .single();

          setProfile(
            data || {
              email: user.email,
              full_name: user.user_metadata?.full_name || "User",
              avatar_url: user.user_metadata?.avatar_url || null,
            },
          );
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  const goToProfile = () => {
    setOpen(false);
    router.push("/dashboard/profile");
  };

  const handleLogout = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading || !profile) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />;
  }

  const initials = (profile.full_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:ring-offset-2 transition-all hover:shadow-lg">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || "User Avatar"}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-yellow text-white font-bold text-sm flex items-center justify-center">
              {initials || "U"}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 px-2 py-1.5">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || "User Avatar"}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-yellow text-white font-bold flex items-center justify-center">
              {initials || "U"}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">{profile.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground">
              {profile.email || "No email"}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={goToProfile} className="cursor-pointer">
          <User className="h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer">
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
