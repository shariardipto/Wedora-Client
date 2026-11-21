"use server";

import { getSession } from "@/lib/auth/session";
import { uploadToImgbb, type UploadResult } from "@/lib/image-upload";

/**
 * Authenticated image upload (profile photos now; service images in P3).
 * The session is re-checked here — Server Actions are public endpoints.
 */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, code: "AUTH_REQUIRED", message: "Please sign in to upload images." };
  }
  if (session.user.isBlocked) {
    return { ok: false, code: "ACCOUNT_BLOCKED", message: "Your account has been blocked." };
  }

  const purpose = formData.get("purpose") === "service" ? "service" : "avatar";
  if (purpose === "service" && session.user.role !== "vendor") {
    return { ok: false, code: "FORBIDDEN", message: "Only vendors can upload service images." };
  }
  const file = formData.get("file");
  return uploadToImgbb(file as File, `wedora-${purpose}-${session.user.id.slice(-6)}`);
}
