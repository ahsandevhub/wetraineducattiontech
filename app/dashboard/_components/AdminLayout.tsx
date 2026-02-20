"use client";

import type { CrmRole, HrmRole } from "@/app/utils/auth/roles";
import { NotificationBell } from "@/components/hrm/NotificationBell";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Award,
  Bell,
  Briefcase,
  Calendar,
  ClipboardList,
  Database,
  FileBarChart,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Receipt,
  Settings,
  ShoppingCart,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { ProfileMenu } from "./ProfileMenu";
import { TeamSwitcher } from "./TeamSwitcher";

export type Role = "customer" | "admin";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type SidebarData = {
  logo: {
    src: string;
    alt: string;
    title: string;
    description: string;
  };
  navGroups: NavGroup[];
};

type AdminLayoutProps = {
  children: ReactNode;
  role: Role;
  crmRole: CrmRole | null;
  hrmRole: HrmRole | null;
  hasEducationAccess?: boolean;
};

export default function AdminLayout({
  children,
  role,
  crmRole,
  hrmRole,
  hasEducationAccess = true,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const isCrmRoute = pathname.startsWith("/dashboard/crm");
  const isHrmRoute = pathname.startsWith("/dashboard/hrm");

  const adminBreadcrumbMap: Record<string, string> = {
    "/dashboard/admin": "Dashboard",
    "/dashboard/admin/customers": "Customers",
    "/dashboard/admin/payments": "Payments",
    "/dashboard/admin/orders": "Orders",
    "/dashboard/admin/products": "Products",
    "/dashboard/admin/services": "Services",
    "/dashboard/admin/projects": "Projects",
    "/dashboard/admin/certifications": "Certifications",
    "/dashboard/admin/stories": "Client Stories",
  };

  const customerBreadcrumbMap: Record<string, string> = {
    "/dashboard/customer": "Dashboard",
    "/dashboard/customer/services": "My Services",
    "/dashboard/customer/packages": "Browse Packages",
    "/dashboard/customer/payments": "My Payments",
    "/dashboard/profile": "My Profile",
  };

  const crmBreadcrumbMap: Record<string, string> = {
    "/dashboard/crm": "CRM Dashboard",
    "/dashboard/crm/leads": "Leads",
    "/dashboard/crm/logs": "Contact Logs",
    "/dashboard/crm/requests": "My Requests",
    "/dashboard/crm/admin/users": "Users",
    "/dashboard/crm/admin/import": "Import",
    "/dashboard/crm/admin/reports": "Reports",
    "/dashboard/crm/admin/lead-requests": "Lead Requests",
  };

  const hrmBreadcrumbMap: Record<string, string> = {
    "/dashboard/hrm": "HRM Dashboard",
    "/dashboard/hrm/super": "Super Admin",
    "/dashboard/hrm/super/people": "People",
    "/dashboard/hrm/super/criteria": "Criteria",
    "/dashboard/hrm/super/criteria-sets": "Criteria Sets",
    "/dashboard/hrm/super/assignments": "Assignments",
    "/dashboard/hrm/super/weeks": "Weeks",
    "/dashboard/hrm/super/submissions": "Submissions",
    "/dashboard/hrm/super/reports/monthly": "Monthly Report",
    "/dashboard/hrm/admin": "Admin Dashboard",
    "/dashboard/hrm/admin/marking": "Marking List",
    "/dashboard/hrm/employee": "My KPI",
    "/dashboard/hrm/notifications": "Notifications",
  };

  const currentTab = isHrmRoute
    ? (hrmBreadcrumbMap[pathname] ?? "HRM")
    : isCrmRoute
      ? (crmBreadcrumbMap[pathname] ?? "CRM")
      : role === "admin"
        ? (adminBreadcrumbMap[pathname] ?? "Dashboard")
        : (customerBreadcrumbMap[pathname] ?? "Dashboard");

  const breadcrumbRoot = isHrmRoute
    ? "HRM"
    : isCrmRoute
      ? "CRM"
      : role === "admin"
        ? "Admin"
        : "Customer";

  const sidebarData: SidebarData = (() => {
    const base = {
      logo: {
        src: "/favicon.png",
        alt: "WeTrain",
        title: "WeTrain",
        description: isHrmRoute
          ? "HRM KPI System"
          : isCrmRoute
            ? "CRM System"
            : role === "admin"
              ? "Admin workspace"
              : "Customer workspace",
      },
    };

    // HRM Navigation (when on HRM routes)
    if (isHrmRoute) {
      return {
        ...base,
        navGroups: [
          {
            title: "HRM KPI",
            items: [
              ...(hrmRole === "SUPER_ADMIN"
                ? [
                    {
                      label: "Super Dashboard",
                      icon: LayoutDashboard,
                      href: "/dashboard/hrm/super",
                    },
                    {
                      label: "People",
                      icon: Users,
                      href: "/dashboard/hrm/super/people",
                    },
                    {
                      label: "Criteria",
                      icon: ListChecks,
                      href: "/dashboard/hrm/super/criteria",
                    },
                    {
                      label: "Criteria Sets",
                      icon: Settings,
                      href: "/dashboard/hrm/super/criteria-sets",
                    },
                    {
                      label: "Assignments",
                      icon: ClipboardList,
                      href: "/dashboard/hrm/super/assignments",
                    },
                    {
                      label: "Weeks",
                      icon: Calendar,
                      href: "/dashboard/hrm/super/weeks",
                    },
                    {
                      label: "Submissions",
                      icon: Database,
                      href: "/dashboard/hrm/super/submissions",
                    },
                    {
                      label: "Monthly Report",
                      icon: FileBarChart,
                      href: "/dashboard/hrm/super/reports/monthly",
                    },
                  ]
                : []),
              ...(hrmRole === "ADMIN"
                ? [
                    {
                      label: "My Dashboard",
                      icon: LayoutDashboard,
                      href: "/dashboard/hrm/admin",
                    },
                    {
                      label: "Marking List",
                      icon: ClipboardList,
                      href: "/dashboard/hrm/admin/marking",
                    },
                  ]
                : []),
              ...(hrmRole === "EMPLOYEE"
                ? [
                    {
                      label: "My KPI",
                      icon: TrendingUp,
                      href: "/dashboard/hrm/employee",
                    },
                  ]
                : []),
              {
                label: "Notifications",
                icon: Bell,
                href: "/dashboard/hrm/notifications",
              },
            ],
          },
        ],
      };
    }

    // CRM Navigation (when on CRM routes)
    if (isCrmRoute) {
      return {
        ...base,
        navGroups: [
          {
            title: "CRM",
            items: [
              {
                label: "Dashboard",
                icon: LayoutDashboard,
                href: "/dashboard/crm",
              },
              {
                label: "Leads",
                icon: Users,
                href: "/dashboard/crm/leads",
              },
              {
                label: "Contact Logs",
                icon: MessageSquare,
                href: "/dashboard/crm/logs",
              },
              ...(crmRole === "MARKETER"
                ? [
                    {
                      label: "My Requests",
                      icon: Briefcase,
                      href: "/dashboard/crm/requests",
                    },
                  ]
                : []),
            ],
          },
          ...(crmRole === "ADMIN"
            ? [
                {
                  title: "Admin",
                  items: [
                    {
                      label: "Users",
                      icon: User,
                      href: "/dashboard/crm/admin/users",
                    },
                    {
                      label: "Import",
                      icon: ShoppingCart,
                      href: "/dashboard/crm/admin/import",
                    },
                    {
                      label: "Lead Requests",
                      icon: Briefcase,
                      href: "/dashboard/crm/admin/lead-requests",
                    },
                  ],
                },
              ]
            : []),
        ],
      };
    }

    // Education Admin Navigation
    if (role === "admin") {
      return {
        ...base,
        navGroups: [
          {
            title: "Overview",
            items: [
              {
                label: "Dashboard",
                icon: LayoutDashboard,
                href: "/dashboard/admin",
              },
              {
                label: "Customers",
                icon: Users,
                href: "/dashboard/admin/customers",
              },
              {
                label: "Payments",
                icon: Receipt,
                href: "/dashboard/admin/payments",
              },
              {
                label: "Orders",
                icon: ShoppingCart,
                href: "/dashboard/admin/orders",
              },
              {
                label: "Services",
                icon: Briefcase,
                href: "/dashboard/admin/services",
              },
              {
                label: "Projects",
                icon: FolderKanban,
                href: "/dashboard/admin/projects",
              },
              {
                label: "Certifications",
                icon: Award,
                href: "/dashboard/admin/certifications",
              },
              {
                label: "Client Stories",
                icon: MessageSquare,
                href: "/dashboard/admin/stories",
              },
            ],
          },
        ],
      };
    }

    // Customer Navigation
    return {
      ...base,
      navGroups: [
        {
          title: "Overview",
          items: [
            {
              label: "Dashboard",
              icon: LayoutDashboard,
              href: "/dashboard/customer",
            },
            {
              label: "Browse Packages",
              icon: ShoppingCart,
              href: "/dashboard/customer/packages",
            },
            {
              label: "Services",
              icon: Zap,
              href: "/dashboard/customer/services",
            },
            {
              label: "Payments",
              icon: Receipt,
              href: "/dashboard/customer/payments",
            },
            {
              label: "Profile",
              icon: User,
              href: "/dashboard/profile",
            },
          ],
        },
      ],
    };
  })();

  const AppSidebar = ({ className }: { className?: string }) => (
    <Sidebar
      className={cn(
        "!bg-[var(--tertiary-yellow)] text-gray-900 border-r border-[var(--primary-yellow)]",
        className,
      )}
    >
      <SidebarHeader>
        <TeamSwitcher
          educationRole={role}
          crmRole={crmRole}
          hrmRole={hrmRole}
          hasEducationAccess={hasEducationAccess}
        />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((group) => {
          // Find the most specific matching item for this pathname within this group
          const activeItemHref = (() => {
            // First check for exact match
            const exactMatch = group.items.find(
              (item) => pathname === item.href,
            );
            if (exactMatch) return exactMatch.href;

            // Otherwise find all items that could match as parent routes
            const potentialMatches = group.items.filter(
              (item) =>
                item.href !== "/dashboard/admin" &&
                item.href !== "/dashboard/customer" &&
                item.href !== "/dashboard/crm" &&
                item.href !== "/dashboard/hrm" &&
                item.href !== "/dashboard/hrm/super" &&
                item.href !== "/dashboard/hrm/admin" &&
                item.href !== "/dashboard/hrm/employee" &&
                pathname.startsWith(item.href + "/"),
            );

            // If there are matches, pick the longest/most specific one
            if (potentialMatches.length > 0) {
              return potentialMatches.reduce((longest, current) =>
                current.href.length > longest.href.length ? current : longest,
              ).href;
            }

            return null;
          })();

          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = item.href === activeItemHref;

                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="text-gray-700 hover:bg-yellow-100 hover:text-gray-900 transition-colors data-[active=true]:!bg-[var(--primary-yellow)] data-[active=true]:border data-[active=true]:!text-gray-900 data-[active=true]:hover:!text-gray-900 hover:border hover:border-amber-300 border border-transparent"
                        >
                          <Link href={item.href}>
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground text-center">
          Version 1.0.0
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );

  return (
    <SidebarProvider className="min-h-screen bg-white text-gray-900">
      <AppSidebar />
      <SidebarInset className="bg-white text-gray-900">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-[var(--primary-yellow)] !bg-[var(--tertiary-yellow)] backdrop-blur-sm px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">{breadcrumbRoot}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">
                    {currentTab.replace(/-/g, " ")}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Notification Bell + Profile Menu on Right */}
          <div className="ml-auto flex items-center gap-4">
            {isHrmRoute && <NotificationBell />}
            <ProfileMenu />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 text-gray-900">
          {/* <div className="flex-1 rounded-xl border border-[var(--primary-yellow)] !bg-[var(--tertiary-yellow)]/20 p-4 shadow-sm shadow-[var(--primary-yellow)]/10"> */}
          {children}
          {/* </div> */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
