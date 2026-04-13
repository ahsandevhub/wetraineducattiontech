import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowRight,
  FileBarChart,
  PackageSearch,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { getStoreAdminDashboardData } from "../_actions/admin-dashboard";

function formatAmount(amount: number) {
  return `${amount.toFixed(2)} BDT`;
}

export default async function StoreAdminPage() {
  const { data, error } = await getStoreAdminDashboardData();

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error loading Store admin dashboard: {error ?? "Unknown error"}
        </div>
      </div>
    );
  }

  const quickLinks = [
    {
      href: "/dashboard/store/admin/products",
      label: "Products",
      description: "Manage prices and active catalog items",
    },
    {
      href: "/dashboard/store/admin/stocks",
      label: "Stocks",
      description: "Review inventory and record stock changes",
    },
    {
      href: "/dashboard/store/admin/accounts",
      label: "Accounts",
      description: "Adjust balances and close months",
    },
    {
      href: "/dashboard/store/admin/reports",
      label: "Reports",
      description: "Open the reporting area",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Store Admin</h1>
        <p className="text-muted-foreground">
          Review current sales, low stock, negative balances, and recent ledger
          activity for {data.currentMonthKey.slice(0, 7)}.
        </p>
      </div>

      {data.summary.lowStockCount > 0 ||
      data.summary.negativeBalanceCount > 0 ? (
        <Card className="border-0 bg-amber-50/50 py-0 shadow-none sm:border sm:border-amber-200 sm:shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-0 pt-0 sm:px-6 sm:pt-6">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <CardTitle className="text-base text-amber-900">
              Operational Attention Needed
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 text-sm text-amber-900 sm:px-6 sm:pb-6">
            {data.summary.lowStockCount > 0
              ? `${data.summary.lowStockCount} low-stock item(s)`
              : "No low-stock items"}
            {" and "}
            {data.summary.negativeBalanceCount > 0
              ? `${data.summary.negativeBalanceCount} employee account(s) below zero`
              : "no employee accounts below zero"}
            {" need review."}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Products at or below 5 units on hand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Month Sales
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(data.summary.currentMonthSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              Confirmed invoice value this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Negative Balances
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.negativeBalanceCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Employees currently below zero balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Ledger Actions
            </CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.recentLedgerCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Latest visible balance mutations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="flex flex-col gap-3 px-0 pt-0 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6">
            <CardTitle className="min-w-0">Quick Links</CardTitle>
            <Badge variant="outline" className="w-fit shrink-0">
              Operations
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 px-0 pb-0 md:grid-cols-2 sm:px-6 sm:pb-6">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{link.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {link.description}
                    </div>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="flex flex-col gap-3 px-0 pt-0 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6">
            <CardTitle className="min-w-0">Low Stock Watchlist</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/store/admin/stocks">Open Stocks</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 px-0 pb-0 sm:px-6 sm:pb-6">
            {data.lowStockItems.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No low-stock items right now.
              </div>
            ) : (
              data.lowStockItems.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Product needs inventory review
                    </div>
                  </div>
                  <Badge
                    variant={item.on_hand <= 0 ? "destructive" : "secondary"}
                  >
                    {item.on_hand} left
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="flex flex-col gap-3 px-0 pt-0 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6">
            <CardTitle className="min-w-0">Employee Balances</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/store/admin/accounts">Open Accounts</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 px-0 pb-0 sm:px-6 sm:pb-6">
            {data.employeeBalances.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No Store users found yet.
              </div>
            ) : (
              data.employeeBalances.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">{user.user_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.user_email}
                    </div>
                  </div>
                  <div
                    className={`text-right text-sm font-medium ${
                      user.balance < 0
                        ? "text-red-600"
                        : user.balance > 0
                          ? "text-emerald-600"
                          : "text-foreground"
                    }`}
                  >
                    {formatAmount(user.balance)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="flex flex-col gap-3 px-0 pt-0 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6">
            <CardTitle className="min-w-0">Recent Ledger Actions</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/store/admin/accounts">View Ledger</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 px-0 pb-0 sm:px-6 sm:pb-6">
            {data.recentLedgerActions.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No ledger activity recorded yet.
              </div>
            ) : (
              data.recentLedgerActions.map((entry) => (
                <div key={entry.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{entry.user_name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {entry.category.replace(/_/g, " ")} by{" "}
                        {entry.actor_name}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {entry.reason}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        entry.amount < 0 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {entry.amount > 0 ? "+" : ""}
                      {formatAmount(entry.amount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
