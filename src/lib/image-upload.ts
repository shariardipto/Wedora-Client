import "server-only";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; code: string; message: string };

const fail = (code: string, message: string): UploadResult => ({ ok: false, code, message });

/** Check the file's magic bytes so a renamed file can't pose as an image. */
export function sniffImageType(bytes: Uint8Array): (typeof ACCEPTED_IMAGE_TYPES)[number] | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

export function validateImageFile(file: unknown): UploadResult | null {
  if (!(file instanceof File) || file.size === 0) {
    return fail("NO_FILE", "Please choose an image to upload.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return fail("FILE_TOO_LARGE", "Images must be 4 MB or smaller.");
  }
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return fail("UNSUPPORTED_TYPE", "Please upload a JPG, PNG or WebP image.");
  }
  return null;
}

/**
 * Uploads an image to ImgBB from the server so the API key never reaches the
 * browser. Returns only a validated https://i.ibb.co/ URL.
 */
export async function uploadToImgbb(file: File, name: string): Promise<UploadResult> {
  const invalid = validateImageFile(file);
  if (invalid) return invalid;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = sniffImageType(bytes);
  if (!detected || detected !== file.type) {
    return fail("INVALID_IMAGE", "This file doesn’t look like a valid image. Please choose another.");
  }

  const key = process.env.IMGBB_API_KEY?.trim();
  if (!key) {
    return fail("UPLOAD_NOT_CONFIGURED", "Image uploads are temporarily unavailable.");
  }

  try {
    const body = new FormData();
    body.append("key", key);
    body.append("name", name.replace(/[^\w-]/g, "").slice(0, 60) || "wedora");
    body.append("image", new Blob([bytes], { type: detected }), `${name}.${detected.split("/")[1]}`);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body,
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success !== true || typeof result?.data?.url !== "string") {
      console.error("ImgBB upload rejected:", response.status, result?.error?.code ?? "unknown");
      return fail("UPLOAD_FAILED", "The image couldn’t be uploaded. Please try again.");
    }

    const url = new URL(result.data.url);
    if (url.protocol !== "https:" || url.hostname !== "i.ibb.co" || url.search || url.hash) {
      return fail("UPLOAD_FAILED", "The image host returned an unexpected link.");
    }
    return { ok: true, url: url.href };
  } catch {
    return fail("UPLOAD_FAILED", "The image couldn’t be uploaded. Please try again.");
  }
}
