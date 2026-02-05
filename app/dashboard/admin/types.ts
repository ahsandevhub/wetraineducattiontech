export type AdminCustomerRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  avatarUrl: string | null;
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

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  code: string;
  category: string;
  price: number | null;
  currency: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminServiceRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number | null;
  discount: number | null;
  currency: string;
  details: string | null;
  keyFeatures: string[];
  featuredImageUrl: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminProjectRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  techStack: string[];
  featuredImageUrl: string;
  liveUrl: string | null;
  githubUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminCertificationRow = {
  id: string;
  title: string;
  issuer: string;
  issuedAt: string;
  description: string;
  credentialId: string | null;
  verifyUrl: string | null;
  imageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminStoryRow = {
  id: string;
  name: string;
  role: string;
  quote: string;
  achievement: string;
  rating: number;
  imageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type BadgeVariant = "default" | "secondary" | "destructive";
