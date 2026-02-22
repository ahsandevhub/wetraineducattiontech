/**
 * HRM Header Component
 * Shows page title and notification bell
 */

"use client";

import { NotificationBell } from "@/components/hrm/NotificationBell";

type HrmHeaderProps = {
  title?: string;
};

export function HrmHeader({ title }: HrmHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        <div className="ml-auto">
          <NotificationBell />
        </div>
      </div>
    </div>
  );
}
