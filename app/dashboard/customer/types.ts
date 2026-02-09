export type CustomerPaymentRow = {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  service: string | null;
  createdAt: string | null;
};

export type CustomerServiceRow = {
  id: string;
  packageName: string;
  amount: number;
  status: string;
  createdAt: string | null;
};

export type CustomerProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  role: string;
  createdAt: string | null;
};

export type CustomerStats = {
  activeServices: number;
  totalSpent: number;
  pendingPayments: number;
};
