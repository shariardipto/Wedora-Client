"use client";

import { useSyncExternalStore } from "react";

const noSubscription = () => () => undefined;
const today = () => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

/**
 * "Monday, November 23", in the visitor's own time zone. It is read in the browser (the server
 * renders nothing), so the day is never the server's when the two differ, and hydration stays clean.
 */
export function TodayLabel({ className }: { className?: string }) {
  const label = useSyncExternalStore(noSubscription, today, () => null);
  if (!label) return null;
  return <span className={className}>{label}</span>;
}
