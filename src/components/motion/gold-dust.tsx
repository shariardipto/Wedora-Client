import { cn } from "@/lib/utils";

/** Deterministic 0–1 pseudo-random (identical on server and client). */
function seeded(index: number, salt: number) {
  const value = Math.sin(index * 91.7 + salt * 47.3) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * CSS-only twinkling gold dust — the lightweight sibling of the hero's WebGL
 * particles. Decorative; static and faint for reduced motion.
 */
export function GoldDust({ count = 48, className }: { count?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {Array.from({ length: count }, (_, index) => {
        const size = 2 + seeded(index, 3) * 6;
        return (
          <span
            key={index}
            className="dust"
            style={
              {
                left: `${(seeded(index, 1) * 100).toFixed(2)}%`,
                top: `${(seeded(index, 2) * 100).toFixed(2)}%`,
                width: `${size.toFixed(1)}px`,
                height: `${size.toFixed(1)}px`,
                animationDuration: `${(2.4 + seeded(index, 4) * 3.2).toFixed(2)}s`,
                animationDelay: `${(-seeded(index, 5) * 5).toFixed(2)}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
