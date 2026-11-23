import { CheckCircle2Icon, PartyPopperIcon, SearchIcon, SendIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { DrawLine } from "@/components/motion/scroll-effects";
import { SectionHeading } from "./section-heading";

const steps = [
  {
    icon: SearchIcon,
    title: "Discover",
    body: "Explore vetted photographers, venues, florists and more. Search by city and sort by price to build your shortlist.",
  },
  {
    icon: SendIcon,
    title: "Request",
    body: "Share your wedding date, venue city and a few notes. Your request goes straight to the vendor.",
  },
  {
    icon: CheckCircle2Icon,
    title: "Confirm",
    body: "Each vendor accepts or declines, and their answer appears on your dashboard. No chasing required.",
  },
  {
    icon: PartyPopperIcon,
    title: "Celebrate",
    body: "With your vendor team confirmed in one place, the final weeks are for the countdown, not the paperwork.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="section-y scroll-mt-20 bg-secondary/60"
    >
      <div className="container-page">
        <SectionHeading
          id="how-title"
          eyebrow="How Wedora works"
          title="From first search to “I do” in four steps"
          description="No endless email threads or guessing who replied. Just a clear path from your first idea to a confirmed vendor team."
        />

        <Stagger
          as="ol"
          gap={0.12}
          className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
        >
          {/* Connecting line behind the step badges on large screens. */}
          <DrawLine className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-gold/0 via-gold to-gold/0 lg:block" />
          {steps.map(({ icon: Icon, title, body }, index) => (
            <StaggerItem
              as="li"
              key={title}
              className="relative flex flex-col items-center text-center"
            >
              <span className="relative grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-md ring-8 ring-secondary">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <span className="mt-5 text-xs font-semibold tracking-[0.2em] text-gold-strong uppercase">
                Step {index + 1}
              </span>
              <h3 className="mt-1 text-2xl font-semibold">{title}</h3>
              <p className="mt-2 max-w-64 text-sm leading-6 text-muted-foreground">
                {body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
