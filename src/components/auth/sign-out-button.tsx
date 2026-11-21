"use client";

import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSignOut } from "./use-sign-out";

export function SignOutButton({ className }: { className?: string }) {
  const { signOut, pending } = useSignOut();
  return (
    <Button
      size="lg"
      className={className ?? "h-11 rounded-full px-6"}
      disabled={pending}
      onClick={() => void signOut()}
    >
      {pending ? <Spinner /> : <LogOutIcon data-icon="inline-start" />}
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
