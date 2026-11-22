"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadImageAction } from "@/actions/upload-image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiRequest } from "@/lib/api-client";
import { SERVICE_CATEGORIES } from "@/lib/categories";
import type { Service } from "@/lib/services/types";
import { serviceFormSchema, type ServiceFormValues } from "@/lib/services/validation";
import { ServiceImagesField, type ImageItem } from "./service-images-field";

type ServiceFormProps =
  | { mode: "create"; service?: undefined; limitReached?: boolean }
  | { mode: "edit"; service: Service; limitReached?: undefined };

const FIELD_KEYS = ["serviceName", "category", "description", "price", "location"] as const;

export function ServiceForm({ mode, service, limitReached }: ServiceFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>(
    service?.images.map((url) => ({ kind: "url" as const, url })) ?? [],
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: service
      ? {
          serviceName: service.serviceName,
          category: service.category,
          description: service.description,
          price: service.price,
          location: service.location,
        }
      : { serviceName: "", description: "", location: "" },
  });
  const description = useWatch({ control, name: "description" }) ?? "";
  const busy = isSubmitting || progress !== null;

  async function uploadPending(): Promise<string[] | null> {
    const pending = images.filter((item) => item.kind === "file");
    const uploaded = new Map<ImageItem, string>();
    let done = 0;
    for (const item of pending) {
      setProgress(`Uploading photo ${done + 1} of ${pending.length}…`);
      const formData = new FormData();
      formData.set("file", item.file);
      formData.set("purpose", "service");
      const result = await uploadImageAction(formData).catch(() => null);
      if (!result?.ok) {
        setImageError(`${item.file.name}: ${result?.message ?? "upload failed. Please try again."}`);
        return null;
      }
      uploaded.set(item, result.url);
      done += 1;
    }
    // Keep the vendor's chosen order; replace uploaded files with their URLs.
    const urls = images.map((item) => (item.kind === "url" ? item.url : uploaded.get(item)!));
    // Uploaded files become URL items so a retry after an API error doesn't re-upload.
    setImages(urls.map((url) => ({ kind: "url", url })));
    return urls;
  }

  async function onSubmit(values: ServiceFormValues) {
    if (images.length === 0) {
      setImageError("Add at least one photo of your service.");
      return;
    }
    setImageError(null);

    const urls = await uploadPending();
    if (!urls) {
      setProgress(null);
      toast.error("Some photos couldn’t be uploaded. Remove them or try again.");
      return;
    }

    setProgress(mode === "create" ? "Submitting for review…" : "Saving changes…");
    try {
      const body = { ...values, images: urls };
      const saved =
        mode === "create"
          ? await apiRequest<Service>("/api/vendor/services", { method: "POST", body })
          : await apiRequest<Service>(`/api/vendor/services/${service.id}`, { method: "PATCH", body });

      if (mode === "create") {
        toast.success("Service submitted! It will be visible to customers once an admin approves it.");
      } else if (saved.status === "pending" && service.status !== "pending") {
        toast.success("Changes saved — your service is back in review.");
      } else {
        toast.success("Service updated.");
      }
      router.push("/dashboard/vendor/services");
      router.refresh();
    } catch (error) {
      setProgress(null);
      if (error instanceof ApiError) {
        for (const detail of error.details ?? []) {
          const field = detail.field as (typeof FIELD_KEYS)[number];
          if (FIELD_KEYS.includes(field)) setError(field, { message: detail.message });
          if (detail.field.startsWith("images")) setImageError(detail.message);
        }
        toast.error(error.message);
      } else {
        toast.error("Your service couldn’t be saved. Please try again.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {limitReached && (
        <Alert>
          <InfoIcon />
          <AlertDescription>
            You already have 3 active services — the Free plan limit. Pause or delete a service, or{" "}
            <Link href="/dashboard/vendor/subscription" className="font-medium text-primary underline-offset-4 hover:underline">
              upgrade to Premium
            </Link>{" "}
            for unlimited services, before adding another.
          </AlertDescription>
        </Alert>
      )}
      {mode === "edit" && service.status !== "pending" && (
        <Alert>
          <InfoIcon />
          <AlertDescription>
            Changing the details of a {service.status} service sends it back to the Wedora team for review.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Service details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-5">
            <Field data-invalid={!!errors.serviceName}>
              <FieldLabel htmlFor="service-name">Service name</FieldLabel>
              <Input
                id="service-name"
                placeholder="e.g. Full-day Wedding Photography"
                className="h-11"
                aria-invalid={!!errors.serviceName}
                disabled={busy}
                {...register("serviceName")}
              />
              <FieldError errors={[errors.serviceName]} />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.category}>
                <FieldLabel htmlFor="service-category">Category</FieldLabel>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={busy}>
                      <SelectTrigger id="service-category" className="h-11! w-full" aria-invalid={!!errors.category}>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((category) => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.category]} />
              </Field>

              <Field data-invalid={!!errors.price}>
                <FieldLabel htmlFor="service-price">Price (USD)</FieldLabel>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="service-price"
                    type="number"
                    inputMode="numeric"
                    min={10}
                    step={1}
                    placeholder="2500"
                    className="h-11 pl-7"
                    aria-invalid={!!errors.price}
                    disabled={busy}
                    {...register("price", { valueAsNumber: true })}
                  />
                </div>
                <FieldDescription className="text-xs">Your starting price in US dollars.</FieldDescription>
                <FieldError errors={[errors.price]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.location}>
              <FieldLabel htmlFor="service-location">Location</FieldLabel>
              <Input
                id="service-location"
                placeholder="e.g. Austin, TX"
                className="h-11"
                aria-invalid={!!errors.location}
                disabled={busy}
                {...register("location")}
              />
              <FieldError errors={[errors.location]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="service-description">Description</FieldLabel>
              <Textarea
                id="service-description"
                rows={6}
                placeholder="What’s included, packages, coverage hours, team size, travel…"
                aria-invalid={!!errors.description}
                disabled={busy}
                {...register("description")}
              />
              <FieldDescription className="flex justify-between text-xs">
                <span>At least 30 characters.</span>
                <span aria-live="polite">{description.length}/2000</span>
              </FieldDescription>
              <FieldError errors={[errors.description]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceImagesField
            items={images}
            onChange={setImages}
            disabled={busy}
            error={imageError ?? undefined}
            onError={setImageError}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-full px-5"
          disabled={busy}
          onClick={() => router.push("/dashboard/vendor/services")}
        >
          Cancel
        </Button>
        <Button type="submit" className="h-11 rounded-full px-6" disabled={busy || Boolean(limitReached)}>
          {busy && <Spinner />}
          {progress ?? (mode === "create" ? "Submit for review" : "Save changes")}
        </Button>
      </div>
    </form>
  );
}
