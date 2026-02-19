import { requireHrmSuperAdmin } from "@/app/utils/auth/require";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList, Settings, UserCheck, Users } from "lucide-react";
import Link from "next/link";

export default async function HrmSuperAdminPage() {
  await requireHrmSuperAdmin();

  const cards = [
    {
      href: "/dashboard/hrm/super/people",
      icon: Users,
      title: "People Management",
      description: "Manage user roles and access",
    },
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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HRM Super Admin</h1>
        <p className="text-muted-foreground">
          Configure the HRM system: manage people, criteria, and assignments
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
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
  );
}
