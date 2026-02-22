"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useMemo, useState } from "react";

type AppInfo = {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  emoji: string;
};

type ApplicationSwitcherProps = {
  educationRole: "admin" | "customer";
  crmRole?: "ADMIN" | "MARKETER" | null;
  hrmRole?: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE" | null;
  hasEducationAccess?: boolean;
};

export function ApplicationSwitcher({
  educationRole,
  crmRole,
  hrmRole,
  hasEducationAccess = true,
}: ApplicationSwitcherProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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
          description: "Admin Dashboard",
          href: "/dashboard/admin",
          icon: GraduationCap,
          color: "from-blue-500 to-blue-600",
          emoji: "🎓",
        });
      } else {
        apps.push({
          name: "Education",
          description: "Customer Dashboard",
          href: "/dashboard/customer",
          icon: GraduationCap,
          color: "from-blue-500 to-blue-600",
          emoji: "🎓",
        });
      }
    }

    // CRM app (only if user has CRM access)
    if (crmRole) {
      apps.push({
        name: "CRM",
        description: "CRM System",
        href: "/dashboard/crm",
        icon: Building2,
        color: "from-purple-500 to-purple-600",
        emoji: "📊",
      });
    }

    // HRM app (only if user has HRM access)
    if (hrmRole) {
      apps.push({
        name: "HRM KPI",
        description: "KPI System",
        href: "/dashboard/hrm",
        icon: TrendingUp,
        color: "from-emerald-500 to-emerald-600",
        emoji: "📈",
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
  if (availableApps.length <= 1 || !currentApp) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="px-2 py-1.5 text-sm rounded-sm">
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-amber-500 text-white font-semibold">
                <currentApp.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium text-sm">{currentApp?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {currentApp?.description}
                </span>
              </div>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setIsOpen(true)}
            size="lg"
            className="data-[state=open]:bg-amber-50 data-[state=open]:hover:bg-amber-50 data-[state=open]:text-sidebar-accent-foreground border border-amber-300 hover:border-amber-400 bg-yellow-50 hover:bg-yellow-50 cursor-pointer"
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
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Switch Application</DialogTitle>
          </DialogHeader>

          <RadioGroup
            value={currentApp?.name}
            onValueChange={() => setIsOpen(false)}
            className="space-y-3 py-4"
          >
            {availableApps.map((app) => {
              const Icon = app.icon;
              const isActive = currentApp?.name === app.name;

              return (
                <Link key={app.name} href={app.href}>
                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem
                      value={app.name}
                      id={app.name}
                      className="border-2 border-muted-foreground"
                      onClick={(e) => e.preventDefault()}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-md ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {app.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {app.description}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <div className="text-xs font-semibold text-primary">
                        Active
                      </div>
                    )}
                  </label>
                </Link>
              );
            })}
          </RadioGroup>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Select an application to switch
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
