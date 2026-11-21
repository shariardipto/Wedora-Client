"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { uploadImageAction } from "@/actions/upload-image";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { postAuthDestination } from "@/lib/auth/redirect";
import {
  signUpSchema,
  type SelfServiceRole,
  type SignUpInput,
} from "@/lib/auth/validation";
import { AvatarPicker } from "./avatar-picker";
import { GoogleButton } from "./google-button";
import { PasswordInput } from "./password-input";
import { RoleChoice } from "./role-choice";

type Stage = "idle" | "creating" | "uploading";

export function SignUpForm({
  callbackUrl,
  defaultRole,
}: {
  callbackUrl?: string;
  defaultRole?: SelfServiceRole;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,

    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      accountType: defaultRole,
      businessName: "",
    },
  });

  const busy = stage !== "idle";
  const accountType = useWatch({ control, name: "accountType" });
  const name = useWatch({ control, name: "name" });

  async function onSubmit(values: SignUpInput) {
    setStage("creating");
    const { data, error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      // `accountType` becomes the protected `role` in a server hook (never admin).
      accountType: values.accountType,
      businessName: values.accountType === "vendor" ? values.businessName || undefined : undefined,
    } as Parameters<typeof authClient.signUp.email>[0]);

    if (error || !data) {
      toast.error(authErrorMessage(error, "We couldn’t create your account. Please try again."));
      setStage("idle");
      return;
    }

    // Optional profile photo: uploaded after sign-up, once a session exists.
    if (avatar) {
      setStage("uploading");
      const formData = new FormData();
      formData.set("file", avatar);
      formData.set("purpose", "avatar");
      const upload = await uploadImageAction(formData).catch(() => null);
      if (upload?.ok) {
        const { error: updateError } = await authClient.updateUser({ image: upload.url });
        if (updateError) toast.warning("Your photo couldn’t be saved. You can add it in Profile Settings.");
      } else {
        toast.warning(
          `${upload?.message ?? "Your photo couldn’t be uploaded."} You can add one later in Profile Settings.`,
        );
      }
    }

    toast.success(`Welcome to Wedora, ${values.name.split(" ")[0]}! Your account is ready.`);
    router.replace(postAuthDestination(values.accountType, callbackUrl));
    router.refresh();
  }

  const signInHref = callbackUrl
    ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/signin";

  return (
    <div className="space-y-6">
      <GoogleButton label="Sign up with Google" callbackUrl={callbackUrl} disabled={busy} />
      <p className="-mt-3 text-center text-xs text-muted-foreground">
        You’ll choose Customer or Vendor right after connecting Google.
      </p>
      <FieldSeparator className="my-1 text-xs *:data-[slot=field-separator-content]:bg-card">or sign up with email</FieldSeparator>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          <Field data-invalid={!!errors.accountType}>
            <FieldLabel id="signup-role-label">I am joining as</FieldLabel>
            <Controller
              control={control}
              name="accountType"
              render={({ field }) => (
                <RoleChoice
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={busy}
                  invalid={!!errors.accountType}
                  aria-labelledby="signup-role-label"
                />
              )}
            />
            <FieldError errors={[errors.accountType]} />
          </Field>

          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="signup-name">Full name</FieldLabel>
            <Input
              id="signup-name"
              autoComplete="name"
              placeholder="e.g. Emily Carter"
              className="h-11"
              aria-invalid={!!errors.name}
              disabled={busy}
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          {accountType === "vendor" && (
            <Field data-invalid={!!errors.businessName}>
              <FieldLabel htmlFor="signup-business">
                Business name <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="signup-business"
                autoComplete="organization"
                placeholder="e.g. Golden Hour Studio"
                className="h-11"
                aria-invalid={!!errors.businessName}
                disabled={busy}
                {...register("businessName")}
              />
              <FieldError errors={[errors.businessName]} />
            </Field>
          )}

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="signup-email">Email</FieldLabel>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11"
              aria-invalid={!!errors.email}
              disabled={busy}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
            <PasswordInput
              id="signup-password"
              autoComplete="new-password"
              placeholder="Create a password"
              aria-invalid={!!errors.password}
              aria-describedby="signup-password-hint"
              disabled={busy}
              {...register("password")}
            />
            <FieldDescription id="signup-password-hint" className="text-xs">
              At least 6 characters, with an uppercase and a lowercase letter.
            </FieldDescription>
            <FieldError errors={[errors.password]} />
          </Field>

          <Field>
            <FieldLabel>
              Profile photo <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <AvatarPicker
              file={avatar}
              onFileChange={setAvatar}
              name={name}
              disabled={busy}
              error={avatarError ?? undefined}
              onError={setAvatarError}
            />
          </Field>

          <Button type="submit" disabled={busy} className="h-11 w-full rounded-full text-sm">
            {busy && <Spinner />}
            {stage === "creating"
              ? "Creating your account…"
              : stage === "uploading"
                ? "Uploading your photo…"
                : "Create Account"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={signInHref} className="font-semibold text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
