import { cn } from "@/lib/utils";
import type { AuthorSummary } from "@/lib/community";

/** Avatar image, or the first letter on a tinted disc when the profile has none. */
export function UserAvatar({
  user,
  size = 28,
  className,
}: {
  user: Pick<AuthorSummary, "displayName" | "username" | "avatarUrl">;
  size?: number;
  className?: string;
}) {
  const initial = (user.displayName || user.username || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-neutral-700 ring-1 ring-black/5",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.42) }}
      aria-hidden
    >
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <span className="font-semibold">{initial}</span>
      )}
    </span>
  );
}
