import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({ value = 0, max = 100, className, ...props }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
