"use client";

import Image from "next/image";
import { useRef } from "react";
import { ImagePlusIcon, StarIcon, XIcon } from "lucide-react";
import { checkImageFile } from "@/components/auth/avatar-picker";
import { useFilePreview } from "@/hooks/use-file-preview";
import { MAX_SERVICE_IMAGES } from "@/lib/services/validation";
import { cn } from "@/lib/utils";

/** An image already hosted on ImgBB, or a local file waiting to be uploaded. */
export type ImageItem = { kind: "url"; url: string } | { kind: "file"; file: File; id: string };

type Props = {
  items: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  disabled?: boolean;
  error?: string;
  onError: (message: string | null) => void;
};

function Preview({ item }: { item: ImageItem }) {
  const localPreview = useFilePreview(item.kind === "file" ? item.file : null);

  if (item.kind === "url") {
    return <Image src={item.url} alt="" fill sizes="200px" className="object-cover" />;
  }
  // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimizable
  return localPreview ? <img src={localPreview} alt="" className="absolute inset-0 size-full object-cover" /> : null;
}

/** 1–5 service photos; the first one is the cover shown on cards. */
export function ServiceImagesField({ items, onChange, disabled, error, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_SERVICE_IMAGES - items.length;

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const accepted: ImageItem[] = [];
    let problem: string | null = null;
    for (const file of Array.from(files)) {
      if (accepted.length >= remaining) {
        problem = `You can add up to ${MAX_SERVICE_IMAGES} images.`;
        break;
      }
      const issue = checkImageFile(file);
      if (issue) {
        problem = `${file.name}: ${issue}`;
        continue;
      }
      accepted.push({ kind: "file", file, id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}` });
    }
    onError(problem);
    if (accepted.length) onChange([...items, ...accepted]);
  }

  const key = (item: ImageItem) => (item.kind === "url" ? item.url : item.id);

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item, index) => (
          <li key={key(item)} className="group relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-border">
            <Preview item={item} />
            {index === 0 ? (
              <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-semibold text-primary-foreground">
                Cover
              </span>
            ) : (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange([item, ...items.filter((_, i) => i !== index)])}
                className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[0.65rem] font-semibold opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <StarIcon className="size-3" aria-hidden="true" /> Make cover
              </button>
            )}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              aria-label={`Remove image ${index + 1}`}
              className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <XIcon className="size-3.5" />
            </button>
            {item.kind === "file" && (
              <span className="absolute top-2 left-2 rounded-full bg-gold px-2 py-0.5 text-[0.6rem] font-semibold text-night">
                New
              </span>
            )}
          </li>
        ))}
        {remaining > 0 && (
          <li>
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                error ? "border-destructive" : "border-border",
              )}
            >
              <ImagePlusIcon className="size-6" aria-hidden="true" />
              Add photos
              <span className="text-xs">{remaining} left</span>
            </button>
          </li>
        )}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label="Service photos"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">
        1–{MAX_SERVICE_IMAGES} photos · JPG, PNG or WebP · up to 4 MB each. The first photo is the cover.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
