import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** "Petal & Twine Florals" → "PT": the first letters of the first two words that start with one. */
export function getInitials(name?: string | null) {
  return (
    (name ?? "")
      .split(/\s+/)
      .map((part) => part.match(/\p{L}|\p{N}/u)?.[0])
      .filter((initial): initial is string => Boolean(initial))
      .slice(0, 2)
      .map((initial) => initial.toUpperCase())
      .join("") || "W"
  );
}

export function UserAvatar({
  name,
  image,
  className,
}: {
  name?: string | null;
  image?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-9", className)}>
      {image && (
        <AvatarImage src={image} alt="" referrerPolicy="no-referrer" className="object-cover" />
      )}
      <AvatarFallback className="bg-secondary text-xs font-semibold text-primary">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
