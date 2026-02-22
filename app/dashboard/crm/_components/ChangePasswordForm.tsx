"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword) return toast.error("Enter a new password");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch("/api/crm/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Failed to change password");
      } else {
        toast.success("Password changed successfully");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (e) {
      console.error(e);
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>New Password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <Label>Confirm Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={loading}>
            Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
