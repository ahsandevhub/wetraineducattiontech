"use client";

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
  Briefcase,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Package,
  Receipt,
  ShoppingCart,
  User,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
};

export default function AdminLayout({ children, role }: AdminLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  const currentTab =
    role === "admin"
      ? (adminBreadcrumbMap[pathname] ?? "Dashboard")
      : (searchParams.get("tab") ?? "Dashboard");
  const breadcrumbRoot = role === "admin" ? "Admin" : "Customer";

  const sidebarData: SidebarData = (() => {
    const base = {
      logo: {
        src: "/favicon.png",
        alt: "WeTrain",
        title: "WeTrain",
        description:
          role === "admin" ? "Admin workspace" : "Customer workspace",
      },
    };

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
                label: "Products",
                icon: Package,
                href: "/dashboard/admin/products",
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
              label: "Services",
              icon: Zap,
              href: "/dashboard/customer?tab=services",
            },
            {
              label: "Payments",
              icon: Receipt,
              href: "/dashboard/customer?tab=payments",
            },
            {
              label: "Tasks",
              icon: ClipboardList,
              href: "/dashboard/customer?tab=tasks",
            },
            {
              label: "Profile",
              icon: User,
              href: "/dashboard/customer?tab=profile",
            },
          ],
        },
      ],
    };
  })();

  const AppSidebar = ({ className }: { className?: string }) => (
    <Sidebar className={cn(className)}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const [baseHref, queryString] = item.href.split("?");
                  const tabValue = queryString?.startsWith("tab=")
                    ? queryString.replace("tab=", "")
                    : null;
                  const isActive = tabValue
                    ? pathname === baseHref &&
                      searchParams.get("tab") === tabValue
                    : pathname === baseHref ||
                      (baseHref !== "/dashboard/admin" &&
                        pathname.startsWith(baseHref));
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="data-[active=true]:!bg-black data-[active=true]:!text-white data-[active=true]:hover:!bg-black data-[active=true]:hover:!text-white"
                      >
                        <Link href={item.href}>
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
    <SidebarProvider className="min-h-screen">
      <AppSidebar />
      <SidebarInset>
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
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

          {/* Profile Menu on Right */}
          <div className="ml-auto">
            <ProfileMenu />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex-1 rounded-xl bg-muted/50 p-4">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
