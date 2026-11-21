"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { uploadImageAction } from "@/actions/upload-image";
import { AvatarPicker } from "@/components/auth/avatar-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { businessNameSchema, nameSchema, phoneSchema } from "@/lib/auth/validation";

const formSchema = z.object({
  name: nameSchema,
  phone: z.union([phoneSchema, z.literal("")]),
  businessName: businessNameSchema,
});
type FormValues = z.infer<typeof formSchema>;

type ProfileUser = {
  name: string;
  email: string;
  image: string | null;
  role: string | null;
  businessName: string | null;
  phone: string | null;
  subscriptionPlan: string;
};

const ROLE_LABEL: Record<string, string> = { customer: "Customer", vendor: "Vendor", admin: "Admin" };

export function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(user.image);
  const [stage, setStage] = useState<"idle" | "uploading" | "saving">("idle");
  const isVendor = user.role === "vendor";

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
      businessName: user.businessName ?? "",
    },
  });
  const name = useWatch({ control, name: "name" });
  const imageChanged = avatar !== null || currentImage !== user.image;
  const busy = stage !== "idle";

  async function onSubmit(values: FormValues) {
    let image = currentImage;

    if (avatar) {
      setStage("uploading");
      const formData = new FormData();
      formData.set("file", avatar);
      formData.set("purpose", "avatar");
      const upload = await uploadImageAction(formData).catch(() => null);
      if (!upload?.ok) {
        toast.error(upload?.message ?? "Your photo couldn’t be uploaded. Please try again.");
        setStage("idle");
        return;
      }
      image = upload.url;
    }

    setStage("saving");
    const { error } = await authClient.updateUser({
      name: values.name,
      image,
      phone: values.phone || null,
      ...(isVendor ? { businessName: values.businessName || null } : {}),
    } as Parameters<typeof authClient.updateUser>[0]);
    setStage("idle");

    if (error) {
      toast.error(authErrorMessage(error, "Your profile couldn’t be saved. Please try again."));
      return;
    }
    setAvatar(null);
    setCurrentImage(image);
    reset(values);
    toast.success("Profile updated.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Profile photo</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarPicker
            file={avatar}
            onFileChange={setAvatar}
            currentUrl={currentImage}
            onRemoveCurrent={() => setCurrentImage(null)}
            name={name}
            disabled={busy}
            error={avatarError ?? undefined}
            onError={setAvatarError}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Personal details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-5">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
              <Input
                id="profile-name"
                autoComplete="name"
                className="h-11"
                aria-invalid={!!errors.name}
                disabled={busy}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input id="profile-email" value={user.email} readOnly disabled className="h-11" />
              <FieldDescription className="text-xs">Your sign-in email can’t be changed.</FieldDescription>
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="profile-phone">
                Phone <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (512) 555-0147"
                className="h-11"
                aria-invalid={!!errors.phone}
                disabled={busy}
                {...register("phone")}
              />
              <FieldError errors={[errors.phone]} />
            </Field>

            {isVendor && (
              <Field data-invalid={!!errors.businessName}>
                <FieldLabel htmlFor="profile-business">Business name</FieldLabel>
                <Input
                  id="profile-business"
                  autoComplete="organization"
                  placeholder="e.g. Golden Hour Studio"
                  className="h-11"
                  aria-invalid={!!errors.businessName}
                  disabled={busy}
                  {...register("businessName")}
                />
                <FieldDescription className="text-xs">Shown to couples on your services.</FieldDescription>
                <FieldError errors={[errors.businessName]} />
              </Field>
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">Account type</span>
          <Badge variant="secondary">{ROLE_LABEL[user.role ?? ""] ?? "Not set"}</Badge>
          {isVendor && (
            <>
              <span className="ml-4 text-muted-foreground">Plan</span>
              <Badge variant={user.subscriptionPlan === "premium" ? "default" : "outline"}>
                {user.subscriptionPlan === "premium" ? "Premium" : "Free"}
              </Badge>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-full px-5"
          disabled={busy || (!isDirty && !imageChanged)}
          onClick={() => {
            reset();
            setAvatar(null);
            setAvatarError(null);
            setCurrentImage(user.image);
          }}
        >
          Discard changes
        </Button>
        <Button
          type="submit"
          className="h-11 rounded-full px-6"
          disabled={busy || (!isDirty && !imageChanged)}
        >
          {busy && <Spinner />}
          {stage === "uploading" ? "Uploading photo…" : stage === "saving" ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
