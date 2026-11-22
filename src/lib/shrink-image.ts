/**
 * In-browser image downscaling before upload.
 *
 * A 12-megapixel phone photo is 3–5 MB. Shown as an avatar it never needs more
 * than a few hundred pixels, so uploading the original makes the save slow
 * (browser → Server Action → ImgBB) and every page that shows it heavier.
 * Shrinking first turns it into a ~30–60 KB WebP. When the browser can't decode
 * or re-encode the file, the original is returned unchanged and the server's own
 * size/type/magic-byte checks still decide.
 */

export type ShrinkOptions = {
  /** Longest edge of the output, in pixels. */
  maxEdge: number;
  /** Centre-crop to a square first (avatars are shown as `object-cover` circles). */
  square?: boolean;
  /** Encoder quality, 0–1. */
  quality?: number;
};

export type ShrinkPlan = { sx: number; sy: number; sw: number; sh: number; width: number; height: number };

/** Source rectangle and output size for a given image (pure, unit-tested). */
export function planShrink(srcWidth: number, srcHeight: number, { maxEdge, square = false }: ShrinkOptions): ShrinkPlan {
  let sx = 0;
  let sy = 0;
  let sw = srcWidth;
  let sh = srcHeight;
  if (square) {
    const side = Math.min(srcWidth, srcHeight);
    sx = Math.floor((srcWidth - side) / 2);
    sy = Math.floor((srcHeight - side) / 2);
    sw = side;
    sh = side;
  }
  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  return {
    sx,
    sy,
    sw,
    sh,
    width: Math.max(1, Math.round(sw * scale)),
    height: Math.max(1, Math.round(sh * scale)),
  };
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function shrinkImage(file: File, options: ShrinkOptions): Promise<File> {
  if (typeof window === "undefined" || typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const plan = planShrink(bitmap.width, bitmap.height, options);
    const unchanged = plan.width === bitmap.width && plan.height === bitmap.height;
    // Already small enough: re-encoding would only cost quality.
    if (unchanged && file.size <= 200 * 1024) return file;

    const canvas = document.createElement("canvas");
    canvas.width = plan.width;
    canvas.height = plan.height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, plan.sx, plan.sy, plan.sw, plan.sh, 0, 0, plan.width, plan.height);

    const quality = options.quality ?? 0.86;
    let blob = await toBlob(canvas, "image/webp", quality);
    if (!blob || blob.type !== "image/webp") {
      // Older Safari can't encode WebP: use JPEG, on white so transparent PNGs don't turn black.
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, plan.width, plan.height);
      blob = await toBlob(canvas, "image/jpeg", quality);
    }
    if (!blob || (blob.type !== "image/webp" && blob.type !== "image/jpeg")) return file;
    if (unchanged && blob.size >= file.size) return file;

    const extension = blob.type === "image/webp" ? "webp" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.${extension}`, { type: blob.type, lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    bitmap.close();
  }
}
