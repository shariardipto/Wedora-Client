"use client";

import { useId, useRef, useState } from "react";
import { CameraIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFilePreview } from "@/hooks/use-file-preview";
import { shrinkImage } from "@/lib/shrink-image";

/** Largest file the upload accepts (the server enforces the same limit). */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
/** Largest original we accept for a profile photo; it's shrunk in the browser before upload. */
const AVATAR_SOURCE_MAX_BYTES = 20 * 1024 * 1024;
/** Avatars are shown at most ~96 px wide, so 512 px covers 3× screens with room to spare. */
const AVATAR_EDGE = 512;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** Client-side pre-check (the server validates again, including magic bytes). */
export function checkImageFile(file: File, maxBytes = MAX_UPLOAD_BYTES): string | null {
  if (!ACCEPTED.includes(file.type)) return "Please choose a JPG, PNG or WebP image.";
  if (file.size > maxBytes) return `Images must be ${Math.round(maxBytes / (1024 * 1024))} MB or smaller.`;
  return null;
}

type AvatarPickerProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Existing image URL (profile settings). */
  currentUrl?: string | null;
  onRemoveCurrent?: () => void;
  name?: string;
  disabled?: boolean;
  /** The chosen photo is being uploaded. */
  uploading?: boolean;
  error?: string;
  onError?: (message: string | null) => void;
};

function initials(name?: string) {
  return (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "W";
}

export function AvatarPicker({
  file,
  onFileChange,
  currentUrl,
  onRemoveCurrent,
  name,
  disabled,
  uploading,
  error,
  onError,
}: AvatarPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useFilePreview(file);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);

  const shown = preview ?? currentUrl ?? null;
  const locked = disabled || preparing;
  const working = preparing || uploading;

  async function accept(selected: File | undefined) {
    if (!selected || locked) return;
    const problem = checkImageFile(selected, AVATAR_SOURCE_MAX_BYTES);
    if (problem) {
      onError?.(problem);
      return;
    }
    onError?.(null);
    setPreparing(true);
    const small = await shrinkImage(selected, { maxEdge: AVATAR_EDGE, square: true });
    setPreparing(false);
    // Only reachable when the browser couldn't shrink a large original.
    if (small.size > MAX_UPLOAD_BYTES) {
      onError?.("This photo is too large to upload. Please choose one under 4 MB.");
      return;
    }
    onFileChange(small);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    void accept(selected);
  }

  function handleDrag(event: React.DragEvent) {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = locked ? "none" : "copy";
    if (!locked) setDragging(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    void accept(event.dataTransfer.files?.[0]);
  }

  const openPicker = () => inputRef.current?.click();

  const status = preparing
    ? "Preparing your photo…"
    : uploading
      ? "Uploading your photo…"
      : file
        ? "New photo ready. Save changes to use it."
        : shown
          ? "This is how you appear on Wedora."
          : "Add a photo to personalise your account.";

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-dragging={dragging || undefined}
      className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-secondary/30 p-5 text-center transition-colors data-dragging:border-primary data-dragging:bg-primary/5 sm:flex-row sm:p-6 sm:text-left"
    >
      <button
        type="button"
        onClick={openPicker}
        disabled={locked}
        aria-label={shown ? "Change profile photo" : "Upload profile photo"}
        className="group relative shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed"
      >
        <Avatar className="size-24 shadow-md ring-4 ring-card">
          {shown && <AvatarImage src={shown} alt="" className="object-cover" />}
          <AvatarFallback className="bg-secondary font-display text-3xl text-primary">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        {working ? (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-card/70 backdrop-blur-[1px]">
            <Spinner className="size-6 text-primary" />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center rounded-full bg-foreground/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-disabled:opacity-0"
          >
            <CameraIcon className="size-6" />
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute right-0 bottom-0 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md ring-3 ring-card transition-transform group-hover:scale-110"
        >
          <CameraIcon className="size-4" />
        </span>
      </button>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium" aria-live="polite">
            {status}
          </p>
          <p className="text-xs text-muted-foreground">
            Drag a photo here or choose one. JPG, PNG or WebP. We resize it for you.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-full bg-card px-4"
            disabled={locked}
            onClick={openPicker}
          >
            <CameraIcon data-icon="inline-start" />
            {shown ? "Change photo" : "Upload photo"}
          </Button>
          {(file || currentUrl) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 rounded-full px-3 text-muted-foreground"
              disabled={locked}
              onClick={() => {
                if (file) onFileChange(null);
                else onRemoveCurrent?.();
                onError?.(null);
              }}
            >
              <XIcon data-icon="inline-start" />
              {file ? "Undo" : "Remove"}
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-label="Profile photo"
        onChange={handleChange}
        disabled={locked}
      />
    </div>
  );
}
