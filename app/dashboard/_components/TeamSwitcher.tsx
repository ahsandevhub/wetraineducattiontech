"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Building2,
  ChevronsUpDown,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type AppInfo = {
  name: string;
  logo: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  description: string;
};

type AppSwitcherProps = {
  educationRole: "admin" | "customer";
  crmRole?: "ADMIN" | "MARKETER" | null;
  hrmRole?: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE" | null;
  hasEducationAccess?: boolean;
};

export function TeamSwitcher({
  educationRole,
  crmRole,
  hrmRole,
  hasEducationAccess = true,
}: AppSwitcherProps) {
  const pathname = usePathname();
  const isCrmRoute = pathname.startsWith("/dashboard/crm");
  const isHrmRoute = pathname.startsWith("/dashboard/hrm");

  // Determine available apps based on roles
  const availableApps = useMemo(() => {
    const apps: AppInfo[] = [];

    // Education app (only if user has education access)
    if (hasEducationAccess) {
      if (educationRole === "admin") {
        apps.push({
          name: "Education",
          logo: "WT",
          icon: GraduationCap,
          href: "/dashboard/admin",
          description: "Admin Dashboard",
        });
      } else {
        apps.push({
          name: "Education",
          logo: "WT",
          icon: GraduationCap,
          href: "/dashboard/customer",
          description: "Customer Dashboard",
        });
      }
    }

    // CRM app (only if user has CRM access)
    if (crmRole) {
      apps.push({
        name: "CRM",
        logo: "CR",
        icon: Building2,
        href: "/dashboard/crm",
        description: "CRM System",
      });
    }

    // HRM app (only if user has HRM access)
    if (hrmRole) {
      apps.push({
        name: "HRM KPI",
        logo: "HR",
        icon: TrendingUp,
        href: "/dashboard/hrm",
        description: "KPI System",
      });
    }

    return apps;
  }, [educationRole, crmRole, hrmRole, hasEducationAccess]);

  // Determine current app
  const currentApp = useMemo(() => {
    if (isHrmRoute) {
      return (
        availableApps.find((app) => app.name === "HRM KPI") || availableApps[0]
      );
    }
    if (isCrmRoute) {
      return (
        availableApps.find((app) => app.name === "CRM") || availableApps[0]
      );
    }
    return (
      availableApps.find((app) => app.name === "Education") || availableApps[0]
    );
  }, [isHrmRoute, isCrmRoute, availableApps]);

  // Only show switcher if multiple apps available
  if (availableApps.length <= 1) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="px-2 py-1.5 text-sm rounded-sm">
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-amber-500 text-white font-semibold">
                <currentApp.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium text-sm">{currentApp.name}</span>
                <span className="text-xs text-muted-foreground">
                  {currentApp.description}
                </span>
              </div>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-amber-50 data-[state=open]:hover:bg-amber-50 data-[state=open]:text-sidebar-accent-foreground border border-amber-300 hover:border-amber-400 bg-yellow-50 hover:bg-yellow-50"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-sm bg-amber-500 text-white font-semibold">
                <currentApp.icon className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">{currentApp.name}</span>
                <span className="text-xs text-muted-foreground">
                  {currentApp.description}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="rounded-lg min-w-46"
            align="start"
            side="right"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Applications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableApps.map((app) => {
              const Icon = app.icon;
              const isActive =
                (app.name === "HRM KPI" && isHrmRoute) ||
                (app.name === "CRM" && isCrmRoute) ||
                (app.name === "Education" && !isCrmRoute && !isHrmRoute);

              return (
                <Link key={app.name} href={app.href}>
                  <button
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col gap-0.5 leading-none text-left">
                      <span className="font-medium text-sm">{app.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {app.description}
                      </span>
                    </div>
                  </button>
                </Link>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
