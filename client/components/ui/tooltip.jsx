"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function TooltipProvider({ children }) {
  return <>{children}</>;
}

function Tooltip({ children }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { visible, setVisible });
        }
        return child;
      })}
    </div>
  );
}

function TooltipTrigger({ asChild, children, ...props }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props);
  }
  return <div {...props}>{children}</div>;
}

function TooltipContent({ className, side = "top", visible, children, ...props }) {
  if (!visible) return null;

  const sideClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div
      className={cn(
        "absolute z-50 whitespace-nowrap rounded-md bg-primary px-2.5 py-1 text-xs text-primary-foreground shadow-md animate-in fade-in-50 zoom-in-95 pointer-events-none",
        sideClasses[side] || sideClasses.top,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
