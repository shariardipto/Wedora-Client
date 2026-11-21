"use client";

import { useEffect, useState } from "react";

/**
 * Data-URL preview for a local image file. Unlike object URLs there is nothing
 * to revoke, so React's double-invoked effects in development can't break it.
 */
export function useFilePreview(file: File | null | undefined): string | null {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (!cancelled && typeof reader.result === "string") setPreview({ file, url: reader.result });
    };
    reader.readAsDataURL(file);
    return () => {
      cancelled = true;
      if (reader.readyState === FileReader.LOADING) reader.abort();
    };
  }, [file]);

  // Only return the preview that belongs to the current file.
  return file && preview?.file === file ? preview.url : null;
}
