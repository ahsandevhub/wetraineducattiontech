"use client";

import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { useLinkStatus } from "next/link";
import type { ComponentType, SVGProps } from "react";

type SidebarNavLinkProps = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  showPendingIndicator?: boolean;
};

export function SidebarNavLink({
  label,
  icon: Icon,
  showPendingIndicator = false,
}: SidebarNavLinkProps) {
  const { pending } = useLinkStatus();
  const isPending = showPendingIndicator && pending;

  return (
    <>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {showPendingIndicator ? (
        <span
          aria-hidden="true"
          className="ml-auto flex h-4 w-4 items-center justify-center"
        >
          <LoaderCircle
            className={cn(
              "h-3.5 w-3.5 opacity-0 transition-opacity duration-150",
              isPending && "animate-spin opacity-70",
            )}
          />
        </span>
      ) : null}
      {isPending ? <span className="sr-only">Loading {label}</span> : null}
    </>
  );
}
