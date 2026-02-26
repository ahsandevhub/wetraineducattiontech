"use client";

import { useState } from "react";

/**
 * Hook to handle image loading errors and missing images
 * Returns true if image failed or is null, false otherwise
 */
export function useImageError() {
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageError((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const hasError = (id: string) => {
    return imageError[id] ?? false;
  };

  return {
    handleImageError,
    hasError,
  };
}

/**
 * Returns a placeholder image based on type
 */
export function getPlaceholderImage(
  type: "service" | "project" | "person" | "generic" | "flag" = "generic",
): string {
  const placeholders: Record<string, string> = {
    service:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%236b7280'%3E📦 Service Image%3C/text%3E%3C/svg%3E",
    project:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%236b7280'%3E🚀 Project Image%3C/text%3E%3C/svg%3E",
    person:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23e5e7eb' width='48' height='48'/%3E%3Ccircle cx='24' cy='16' r='8' fill='%239ca3af'/%3E%3Cpath d='M 8 40 Q 8 28 24 28 Q 40 28 40 40' fill='%239ca3af'/%3E%3C/svg%3E",
    flag: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='15'%3E%3Crect fill='%23d1d5db' width='20' height='15'/%3E%3Ctext x='10' y='7' font-size='10' text-anchor='middle' dominant-baseline='middle'%3E?%3C/text%3E%3C/svg%3E",
    generic:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%236b7280'%3E🖼️ Image%3C/text%3E%3C/svg%3E",
  };

  return placeholders[type] || placeholders.generic;
}
