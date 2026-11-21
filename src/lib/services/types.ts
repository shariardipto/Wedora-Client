import type { ServiceCategorySlug } from "@/lib/categories";

export type ServiceStatus = "pending" | "approved" | "rejected";

export type VendorSummary = {
  id: string;
  name: string;
  businessName: string | null;
  image: string | null;
  isPremium: boolean;
};

/** Mirrors the API's ServiceView. */
export type Service = {
  id: string;
  vendorId: string;
  serviceName: string;
  category: ServiceCategorySlug;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: ServiceStatus;
  isAvailable: boolean;
  rejectionReason: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  vendor: VendorSummary | null;
};

export type PageMeta = { page: number; limit: number; total: number; totalPages: number };

export type VendorServicesMeta = {
  activeCount: number;
  activeLimit: number | null;
  isPremium: boolean;
};

export type CategoryCount = { category: ServiceCategorySlug; count: number };

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};
