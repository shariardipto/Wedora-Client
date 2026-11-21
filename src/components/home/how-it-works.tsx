import { CheckCircle2Icon, PartyPopperIcon, SearchIcon, SendIcon } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "./section-heading";

const steps = [
  {
    icon: SearchIcon,
    title: "Discover",
    body: "Browse approved services by category, location and budget, and sort by price.",
  },
  {
    icon: SendIcon,
    title: "Request",
    body: "Choose your event date and location, add a note, and send a booking request.",
  },
  {
    icon: CheckCircle2Icon,
    title: "Confirm",
    body: "The vendor reviews it and accepts or declines — you see the update on your dashboard.",
  },
  {
    icon: PartyPopperIcon,
    title: "Celebrate",
    body: "With every booking tracked in one place, you can focus on the day itself.",
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
          description="A simple, transparent booking flow for couples — and a clear inbox of requests for vendors."
        />

        <Stagger
          as="ol"
          gap={0.12}
          className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
        >
          {/* Connecting line behind the step badges on large screens. */}
          <span
            aria-hidden="true"
            className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0 lg:block"
          />
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
