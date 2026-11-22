import { CheckIcon, CrownIcon, SparklesIcon } from "lucide-react";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Plan = {
  id: "free" | "premium";
  name: string;
  tagline: string;
  price: number;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Everything you need to get started.",
    price: 0,
    features: [
      "Up to 3 active services",
      "Booking requests in your dashboard",
      "Listings reviewed and published by our team",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "For vendors ready to grow.",
    price: 29,
    features: [
      "Unlimited active services",
      "Premium crown on your listings",
      "Everything in Free",
      "Cancel anytime — keep Premium until the period ends",
    ],
  },
];

/** Free vs Premium side by side. `premiumAction` is the upgrade button (or nothing). */
export function PlanCards({ current, premiumAction }: { current: "free" | "premium"; premiumAction?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {PLANS.map((plan) => {
        const isCurrent = plan.id === current;
        const premium = plan.id === "premium";
        return (
          <article
            key={plan.id}
            aria-labelledby={`plan-${plan.id}`}
            className={cn(
              "relative flex flex-col rounded-3xl bg-card p-6 shadow-sm sm:p-7",
              premium ? "ring-2 ring-primary/70" : "ring-1 ring-border",
            )}
          >
            {premium && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-3xl bg-gradient-to-b from-accent/70 to-transparent"
              />
            )}
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <h2 id={`plan-${plan.id}`} className="flex items-center gap-2 text-3xl font-semibold">
                  {premium && <CrownIcon className="size-6 text-gold" aria-hidden="true" />}
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              </div>
              {isCurrent ? (
                <Badge className="border-0 bg-primary text-primary-foreground">Current plan</Badge>
              ) : (
                premium && (
                  <Badge className="border-0 bg-accent text-gold-strong">
                    <SparklesIcon data-icon="inline-start" aria-hidden="true" />
                    Upgrade
                  </Badge>
                )
              )}
            </div>

            <p className="relative mt-6 flex items-end gap-1.5">
              <Price amount={plan.price} variant="display" className="text-5xl" />
              <span className="pb-1 text-sm text-muted-foreground">/ month</span>
            </p>

            <ul className="relative mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                      premium ? "bg-gold text-night" : "bg-secondary text-primary",
                    )}
                  >
                    <CheckIcon className="size-3.5" aria-hidden="true" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            {premium && premiumAction && <div className="relative mt-7">{premiumAction}</div>}
          </article>
        );
      })}
    </div>
  );
}
