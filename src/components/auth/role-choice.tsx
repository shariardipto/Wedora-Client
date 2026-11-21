"use client";

import { BriefcaseIcon, HeartIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SelfServiceRole } from "@/lib/auth/validation";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  value: SelfServiceRole;
  title: string;
  description: string;
  icon: typeof HeartIcon;
}> = [
  {
    value: "customer",
    title: "Customer",
    description: "I’m planning a wedding and want to book services.",
    icon: HeartIcon,
  },
  {
    value: "vendor",
    title: "Vendor",
    description: "I offer wedding services and want to receive bookings.",
    icon: BriefcaseIcon,
  },
];

type RoleChoiceProps = {
  value: SelfServiceRole | undefined;
  onChange: (value: SelfServiceRole) => void;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  "aria-labelledby"?: string;
};

/** Accessible card-style radio group for choosing Customer or Vendor. */
export function RoleChoice({ value, onChange, disabled, invalid, name, ...aria }: RoleChoiceProps) {
  return (
    <RadioGroup
      name={name}
      value={value ?? ""}
      onValueChange={(next) => onChange(next as SelfServiceRole)}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className="grid gap-3 sm:grid-cols-2"
      {...aria}
    >
      {OPTIONS.map(({ value: option, title, description, icon: Icon }) => {
        const selected = value === option;
        return (
          <label
            key={option}
            htmlFor={`role-${option}`}
            className={cn(
              "relative flex cursor-pointer gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              selected ? "border-primary bg-secondary/50" : "border-border",
              invalid && !value && "border-destructive",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full",
                selected ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
              )}
            >
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                {description}
              </span>
            </span>
            <RadioGroupItem id={`role-${option}`} value={option} className="mt-1" />
          </label>
        );
      })}
    </RadioGroup>
  );
}
