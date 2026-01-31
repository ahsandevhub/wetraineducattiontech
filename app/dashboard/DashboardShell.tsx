"use client";

import { createClient } from "@/app/utils/supabase/client";
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
  BarChart3,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  ShoppingCart,
  User,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ComponentType, ReactNode } from "react";

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
  footerGroup: NavGroup;
};

type DashboardShellProps = {
  children: ReactNode;
  role: Role;
};

export default function DashboardShell({
  children,
  role,
}: DashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const currentTab = searchParams.get("tab") ?? "Dashboard";
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
      footerGroup: {
        title: "Support",
        items: [
          { label: "Help Center", icon: HelpCircle, href: "/support" },
          { label: "Settings", icon: Settings, href: "/dashboard/settings" },
        ],
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
                href: "/dashboard/admin?tab=customers",
              },
              {
                label: "Payments",
                icon: Receipt,
                href: "/dashboard/admin?tab=payments",
              },
              {
                label: "Orders",
                icon: ShoppingCart,
                href: "/dashboard/admin?tab=orders",
              },
              {
                label: "Roadmap",
                icon: BarChart3,
                href: "/dashboard/admin?tab=roadmap",
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

  const SidebarLogo = ({ logo }: { logo: SidebarData["logo"] }) => {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={24}
                height={24}
                className="size-6 text-primary-foreground invert dark:invert-0"
              />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-medium">{logo.title}</span>
              <span className="text-xs text-muted-foreground">
                {logo.description}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  };

  const AppSidebar = ({ className }: { className?: string }) => (
    <Sidebar className={cn(className)}>
      <SidebarHeader>
        <SidebarLogo logo={sidebarData.logo} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href.split("?")[0]);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild isActive={isActive}>
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
        <SidebarGroup>
          <SidebarGroupLabel>{sidebarData.footerGroup.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarData.footerGroup.items.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
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
        <Separator className="my-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button type="button" onClick={handleLogout} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );

  return (
    <SidebarProvider className="min-h-screen">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
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
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex-1 rounded-xl bg-muted/50 p-4">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
