"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BanIcon, CrownIcon, EyeIcon, ShieldCheckIcon, UnlockIcon } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/auth/user-avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { AdminUser, AdminUserDetails } from "@/lib/dashboard/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const ROLE_LABEL = { customer: "Customer", vendor: "Vendor", admin: "Admin" } as const;

function RoleBadge({ role }: { role: AdminUser["role"] }) {
  if (!role) return <Badge variant="outline">No role yet</Badge>;
  return (
    <Badge
      className={cn(
        "border-0",
        role === "admin" && "bg-primary text-primary-foreground hover:bg-primary",
        role === "vendor" && "bg-accent text-gold-strong hover:bg-accent",
        role === "customer" && "bg-secondary text-secondary-foreground hover:bg-secondary",
      )}
    >
      {ROLE_LABEL[role]}
    </Badge>
  );
}

function StatusBadge({ blocked }: { blocked: boolean }) {
  return blocked ? (
    <Badge className="border-0 bg-red-100 text-red-900 hover:bg-red-100">Blocked</Badge>
  ) : (
    <Badge className="border-0 bg-emerald-100 text-emerald-900 hover:bg-emerald-100">Active</Badge>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium break-words">{children}</dd>
    </div>
  );
}

export function AdminUsersTable({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [details, setDetails] = useState<{ user: AdminUser; data: AdminUserDetails | null; error?: string } | null>(null);

  async function openDetails(user: AdminUser) {
    setDetails({ user, data: null });
    try {
      const data = await apiRequest<AdminUserDetails>(`/api/admin/users/${user.id}`);
      setDetails((current) => (current?.user.id === user.id ? { user, data } : current));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Couldn’t load this user.";
      setDetails((current) => (current?.user.id === user.id ? { user, data: null, error: message } : current));
    }
  }

  async function toggleBlock() {
    if (!confirming) return;
    const target = confirming;
    setConfirming(null);
    setBusyId(target.id);
    try {
      await apiRequest(`/api/admin/users/${target.id}/block`, {
        method: "PATCH",
        body: { isBlocked: !target.isBlocked },
      });
      toast.success(
        target.isBlocked
          ? `${target.name} is unblocked and can sign in again.`
          : `${target.name} is blocked and has been signed out.`,
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t update this user.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-64 pl-4">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const canBlock = user.role !== "admin" && !isSelf;
              return (
                <TableRow key={user.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.name} image={user.image} className="size-9" />
                      <div className="min-w-0">
                        <p className="flex max-w-64 items-center gap-1 truncate font-medium">
                          {user.name}
                          {user.isPremium && <CrownIcon className="size-3.5 shrink-0 text-gold" aria-label="Premium vendor" />}
                          {isSelf && <span className="text-xs font-normal text-muted-foreground">(you)</span>}
                        </p>
                        <p className="max-w-64 truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge blocked={user.isBlocked} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {user.createdAt ? formatDate(user.createdAt, "short") : "—"}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="rounded-full" onClick={() => void openDetails(user)}>
                        <EyeIcon data-icon="inline-start" /> Details
                      </Button>
                      {canBlock ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("rounded-full", !user.isBlocked && "text-destructive hover:text-destructive")}
                          disabled={busyId === user.id}
                          onClick={() => setConfirming(user)}
                        >
                          {busyId === user.id ? (
                            <Spinner />
                          ) : user.isBlocked ? (
                            <UnlockIcon data-icon="inline-start" />
                          ) : (
                            <BanIcon data-icon="inline-start" />
                          )}
                          {user.isBlocked ? "Unblock" : "Block"}
                        </Button>
                      ) : (
                        <span className="inline-flex h-8 items-center gap-1 px-3 text-xs text-muted-foreground">
                          <ShieldCheckIcon className="size-3.5" aria-hidden="true" /> Protected
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* User details */}
      <Dialog open={details !== null} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent className="sm:max-w-lg">
          {details && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <UserAvatar name={details.user.name} image={details.user.image} className="size-12" />
                  <div className="min-w-0 text-left">
                    <DialogTitle className="font-display text-2xl">{details.user.name}</DialogTitle>
                    <DialogDescription className="truncate">{details.user.email}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex flex-wrap gap-2">
                <RoleBadge role={details.user.role} />
                <StatusBadge blocked={details.user.isBlocked} />
                {details.user.role === "vendor" && (
                  <Badge variant="outline">{details.user.isPremium ? "Premium plan" : "Free plan"}</Badge>
                )}
              </div>
              {details.error ? (
                <p className="text-sm text-destructive">{details.error}</p>
              ) : !details.data ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner /> Loading details…
                </p>
              ) : (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-muted/60 p-4 text-sm">
                  <Detail label="Joined">{details.data.createdAt ? formatDate(details.data.createdAt) : "—"}</Detail>
                  <Detail label="Phone">{details.data.phone || "—"}</Detail>
                  {details.data.role === "vendor" && (
                    <>
                      <Detail label="Business">{details.data.businessName || "—"}</Detail>
                      <Detail label="Premium until">
                        {details.data.isPremium && details.data.subscriptionExpiresAt
                          ? formatDate(details.data.subscriptionExpiresAt)
                          : "—"}
                      </Detail>
                      <Detail label="Services">{`${details.data.activity.services} (${details.data.activity.liveServices} live)`}</Detail>
                      <Detail label="Booking requests received">{details.data.activity.bookingRequestsReceived}</Detail>
                    </>
                  )}
                  {details.data.role === "customer" && (
                    <Detail label="Booking requests sent">{details.data.activity.bookingRequestsSent}</Detail>
                  )}
                </dl>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Block / unblock confirmation */}
      <AlertDialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirming?.isBlocked ? `Unblock ${confirming?.name}?` : `Block ${confirming?.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirming?.isBlocked
                ? "They’ll be able to sign in and use Wedora again."
                : "They’ll be signed out immediately and can’t sign in or use dashboards, bookings or services until unblocked. A blocked vendor’s services are hidden from customers."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant={confirming?.isBlocked ? "default" : "destructive"} onClick={() => void toggleBlock()}>
              {confirming?.isBlocked ? "Unblock user" : "Block user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
