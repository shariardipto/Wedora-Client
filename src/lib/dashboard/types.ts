/** Mirrors the API's stats endpoints. */

export type VendorStats = {
  totalServices: number;
  activeServices: number;
  liveServices: number;
  pendingReviewServices: number;
  pendingBookings: number;
  acceptedBookings: number;
  plan: {
    name: "free" | "premium";
    isPremium: boolean;
    expiresAt: string | null;
    cancelAtPeriodEnd: boolean;
    activeLimit: number | null;
  };
};

export type CustomerStats = {
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
};

export type AdminStats = {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  blockedUsers: number;
  totalServices: number;
  pendingServices: number;
  totalTransactions: number;
};

/** Mirrors the API's admin user views. */
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "customer" | "vendor" | "admin" | null;
  isBlocked: boolean;
  businessName: string | null;
  phone: string | null;
  subscriptionPlan: "free" | "premium";
  subscriptionExpiresAt: string | null;
  subscriptionCancelAtPeriodEnd: boolean;
  isPremium: boolean;
  createdAt: string | null;
};

export type AdminUserDetails = AdminUser & {
  activity: {
    services: number;
    liveServices: number;
    bookingRequestsReceived: number;
    bookingRequestsSent: number;
  };
};
