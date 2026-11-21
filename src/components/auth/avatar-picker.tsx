"use client";

import { useId, useRef } from "react";
import { CameraIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFilePreview } from "@/hooks/use-file-preview";

export const AVATAR_MAX_BYTES = 4 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** Client-side pre-check (the server validates again, including magic bytes). */
export function checkImageFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return "Please choose a JPG, PNG or WebP image.";
  if (file.size > AVATAR_MAX_BYTES) return "Images must be 4 MB or smaller.";
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
  error,
  onError,
}: AvatarPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useFilePreview(file);

  const shown = preview ?? currentUrl ?? null;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = ""; // allow re-selecting the same file
    if (!selected) return;
    const problem = checkImageFile(selected);
    onError?.(problem);
    if (!problem) onFileChange(selected);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16 ring-2 ring-border">
        {shown && <AvatarImage src={shown} alt="Profile preview" className="object-cover" />}
        <AvatarFallback className="bg-secondary font-display text-xl text-primary">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-full px-4"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
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
              disabled={disabled}
              onClick={() => {
                if (file) onFileChange(null);
                else onRemoveCurrent?.();
                onError?.(null);
              }}
            >
              <XIcon data-icon="inline-start" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP · up to 4 MB</p>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-label="Profile photo"
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
