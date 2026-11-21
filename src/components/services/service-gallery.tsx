"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Main image + thumbnail strip for a service's photos. */
export function ServiceGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
        {current && (
          <Image
            key={current}
            src={current}
            alt={`${name} — photo ${active + 1} of ${images.length}`}
            fill
            preload
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2 sm:gap-3" aria-label="Service photos">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-xl ring-2 transition focus-visible:ring-ring focus-visible:outline-none",
                  index === active ? "ring-primary" : "ring-transparent opacity-75 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="(min-width: 1024px) 10vw, 20vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
