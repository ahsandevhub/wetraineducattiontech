"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { CustomerProfile } from "../types";

type CustomerProfileClientProps = {
  profile: CustomerProfile;
};

export default function CustomerProfileClient({
  profile,
}: CustomerProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    postalCode: profile.postalCode || "",
    country: profile.country,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        // Optionally refresh or show success message
        window.location.reload();
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-600">
          Manage your personal information and account details.
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: profile.fullName,
                      email: profile.email,
                      phone: profile.phone || "",
                      address: profile.address || "",
                      city: profile.city || "",
                      state: profile.state || "",
                      postalCode: profile.postalCode || "",
                      country: profile.country,
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.fullName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.phone || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Country</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.country}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Address</p>
                <p className="text-sm font-medium text-gray-900">
                  {profile.address || "—"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">City</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.city || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">State</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.state || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Postal Code</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.postalCode || "—"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Role</p>
                  <Badge className="mt-1">{profile.role}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Member Since
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Password</p>
            <p className="text-xs text-gray-500 mt-1">
              Manage your password and security settings
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
