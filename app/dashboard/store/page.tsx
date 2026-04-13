import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ShoppingCart, Wallet } from "lucide-react";
import Link from "next/link";
import { getStoreDashboardData } from "./_actions/dashboard";

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function StoreDashboardPage() {
  const { data, error } = await getStoreDashboardData();

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Store Dashboard</h1>
          <p className="text-muted-foreground">
            Error loading Store dashboard: {error ?? "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Dashboard</h1>
          <p className="text-muted-foreground">
            Check your current balance, recent purchases, and account activity.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/store/invoices/new">
            New Invoice
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data.currentBalance < 0
                  ? "text-red-600"
                  : data.currentBalance > 0
                    ? "text-emerald-600"
                    : ""
              }`}
            >
              {data.currentBalance.toFixed(2)} BDT
            </div>
            <p className="text-xs text-muted-foreground">
              Ledger-derived available balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month Purchases
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">
              {data.currentMonthPurchaseTotal.toFixed(2)} BDT
            </div>
            <p className="text-xs text-muted-foreground">
              {data.currentMonthPurchaseCount} confirmed purchase
              {data.currentMonthPurchaseCount === 1 ? "" : "s"} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Link
              href="/dashboard/store/purchases"
              className="block text-primary hover:underline"
            >
              View purchase history
            </Link>
            <Link
              href="/dashboard/store/accounts"
              className="block text-primary hover:underline"
            >
              View account ledger
            </Link>
            <Link
              href="/dashboard/store/invoices/new"
              className="block text-primary hover:underline"
            >
              Start a new invoice
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-5 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="flex flex-col gap-2 px-0 pt-0 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6">
            <CardTitle>Recent Purchases</CardTitle>
            <Link
              href="/dashboard/store/purchases"
              className="text-sm text-primary hover:underline sm:text-right"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            {data.recentInvoices.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No purchases yet. Use New Invoice to record your first purchase.
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-medium">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </div>
                      <div className="break-words text-xs text-muted-foreground">
                        Confirmed{" "}
                        {new Date(invoice.confirmed_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <Badge variant="outline">{invoice.status}</Badge>
                      <div className="mt-1 font-medium">
                        {invoice.total_amount.toFixed(2)} BDT
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="space-y-5 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="flex flex-col gap-2 px-0 pt-0 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6">
            <CardTitle>Recent Account Activity</CardTitle>
            <Link
              href="/dashboard/store/accounts"
              className="text-sm text-primary hover:underline sm:text-right"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
            {data.recentAccountEntries.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No account activity yet. Balance entries will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentAccountEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-medium">
                        {formatCategory(entry.category)}
                      </div>
                      <div className="break-words text-xs text-muted-foreground">
                        {entry.reason || "No notes provided"}
                      </div>
                    </div>
                    <div className="sm:ml-4 sm:shrink-0 sm:text-right">
                      <div
                        className={`font-medium ${
                          entry.amount < 0 ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {entry.amount > 0 ? "+" : ""}
                        {entry.amount.toFixed(2)} BDT
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
