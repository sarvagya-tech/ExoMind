import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarImage({ src, alt = "Avatar", className, ...props }) {
  const [error, setError] = React.useState(false);

  if (!src || error) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
