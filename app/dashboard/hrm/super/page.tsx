"use client";

import { SuperAdminDashboardLoadingSkeleton } from "@/components/hrm/DashboardLoadingSkeletons";
import { PendingProfilesTable } from "@/components/hrm/PendingProfilesTable";
import { TierDistributionChart } from "@/components/hrm/TierDistributionChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarCheck,
  ClipboardList,
  Coins,
  Settings,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type DashboardStats = {
  employeesCount: number;
  adminsCount: number;
  pendingCount: number;
  activeWeeksCount: number;
};

type LatestMonth = {
  monthKey: string;
  status: string;
};

type TierDistribution = {
  BONUS: number;
  APPRECIATION: number;
  IMPROVEMENT: number;
  FINE: number;
};

type PendingProfile = {
  id: string;
  email: string;
  full_name: string;
  desired_role: "ADMIN" | "EMPLOYEE";
  is_active: boolean;
  linked_auth_id: string | null;
  linked_at: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
};

export default function HrmSuperAdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    employeesCount: 0,
    adminsCount: 0,
    pendingCount: 0,
    activeWeeksCount: 0,
  });
  const [latestMonth, setLatestMonth] = useState<LatestMonth | null>(null);
  const [tierDistribution, setTierDistribution] = useState<TierDistribution>({
    BONUS: 0,
    APPRECIATION: 0,
    IMPROVEMENT: 0,
    FINE: 0,
  });
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchPendingProfiles();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hrm/super/dashboard-stats");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load dashboard stats");
      }

      setStats(data.stats);
      setLatestMonth(data.latestMonth);
      setTierDistribution(data.tierDistribution);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load stats";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProfiles = async () => {
    setPendingLoading(true);
    try {
      const res = await fetch("/api/hrm/super/pending-profiles?active=true");
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to load pending profiles");
      }

      setPendingProfiles(result.data || []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load pending profiles";
      toast.error(message);
    } finally {
      setPendingLoading(false);
    }
  };

  const navigationCards = [
    {
      href: "/dashboard/hrm/super/criteria",
      icon: ClipboardList,
      title: "Criteria Library",
      description: "Configure evaluation criteria",
    },
    {
      href: "/dashboard/hrm/super/criteria-sets",
      icon: Settings,
      title: "Subject Criteria",
      description: "Assign criteria to subjects",
    },
    {
      href: "/dashboard/hrm/super/assignments",
      icon: UserCheck,
      title: "Assignments",
      description: "Manage marker assignments",
    },
    {
      href: "/dashboard/hrm/super/funds",
      icon: Coins,
      title: "Fund Management",
      description: "Track fine collection and bonus payouts",
    },
  ];

  const totalSubjects =
    tierDistribution.BONUS +
    tierDistribution.APPRECIATION +
    tierDistribution.IMPROVEMENT +
    tierDistribution.FINE;

  if (loading) {
    return <SuperAdminDashboardLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HRM Super Admin</h1>
        <p className="text-muted-foreground">
          Configure the HRM system: manage people, criteria, and assignments
        </p>
      </div>

      {/* Navigation Cards */}
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {navigationCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <Icon className="mb-2 h-8 w-8 text-primary" />
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employeesCount}</div>
            <p className="text-xs text-muted-foreground">
              Active employee accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminsCount}</div>
            <p className="text-xs text-muted-foreground">
              Admins & super admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Profiles
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting registration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Weeks</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWeeksCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently open for marking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Profiles Table */}
      {stats.pendingCount > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Profiles</h2>
          {pendingLoading ? (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              Loading pending profiles...
            </div>
          ) : (
            <PendingProfilesTable
              profiles={pendingProfiles}
              onRefresh={fetchPendingProfiles}
            />
          )}
        </div>
      )}

      {/* Performance Distribution Chart */}
      {latestMonth && (
        <TierDistributionChart
          distribution={tierDistribution}
          monthKey={latestMonth.monthKey}
          totalEmployees={totalSubjects}
        />
      )}
    </div>
  );
}
