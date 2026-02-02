export type AdminCustomerRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string | null;
};

export type AdminPaymentRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string | null;
};

export type AdminOrderRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  amount: number;
  status: string;
  createdAt: string | null;
};

export type AdminStats = {
  totalCustomers: number;
  totalRevenue: number;
  totalOrders: number;
  pendingPayments: number;
};

export type BadgeVariant = "default" | "secondary" | "destructive";
