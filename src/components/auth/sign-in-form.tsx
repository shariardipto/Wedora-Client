"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/client";
import { authErrorMessage } from "@/lib/auth/errors";
import { postAuthDestination } from "@/lib/auth/redirect";
import { signInSchema, type SignInInput } from "@/lib/auth/validation";
import { GoogleButton } from "./google-button";
import { PasswordInput } from "./password-input";

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInInput) {
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error || !data) {
      toast.error(authErrorMessage(error, "Sign-in failed. Please try again."));
      return;
    }
    const firstName = data.user.name.split(" ")[0];
    toast.success(`Welcome back, ${firstName}!`);
    router.replace(postAuthDestination((data.user as { role?: unknown }).role, callbackUrl));
    router.refresh();
  }

  const signUpHref = callbackUrl
    ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/signup";

  return (
    <div className="space-y-6">
      <GoogleButton label="Continue with Google" callbackUrl={callbackUrl} disabled={isSubmitting} />
      <FieldSeparator className="my-1 text-xs *:data-[slot=field-separator-content]:bg-card">or sign in with email</FieldSeparator>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-5">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="signin-email">Email</FieldLabel>
            <Input
              id="signin-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11"
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="signin-password">Password</FieldLabel>
            <PasswordInput
              id="signin-password"
              autoComplete="current-password"
              placeholder="Your password"
              aria-invalid={!!errors.password}
              disabled={isSubmitting}
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-full text-sm">
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Signing in…" : "Sign In"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to Wedora?{" "}
        <Link href={signUpHref} className="font-semibold text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
