import { cn } from "@/lib/utils";

/** Deterministic 0–1 pseudo-random (same output on server and client — no hydration drift). */
function seeded(index: number, salt: number) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Decorative CSS-only petals drifting down over a positioned parent.
 * No JavaScript; hidden entirely for reduced motion (see `.petal` in effects.css).
 */
export function FallingPetals({ count = 12, className }: { count?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {Array.from({ length: count }, (_, index) => {
        const size = 9 + seeded(index, 4) * 12;
        return (
          <span
            key={index}
            className="petal"
            data-tone={index % 3}
            style={
              {
                left: `${(seeded(index, 1) * 100).toFixed(1)}%`,
                width: `${size.toFixed(1)}px`,
                height: `${(size * 1.3).toFixed(1)}px`,
                animationDuration: `${(9 + seeded(index, 3) * 9).toFixed(1)}s`,
                animationDelay: `${(-seeded(index, 2) * 18).toFixed(1)}s`,
                "--petal-drift": `${((seeded(index, 5) - 0.5) * 140).toFixed(0)}px`,
                "--petal-spin": `${(180 + seeded(index, 6) * 360).toFixed(0)}deg`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
