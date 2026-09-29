"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownContext = React.createContext({
  open: false,
  setOpen: () => {},
});

function DropdownMenu({ children }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

function DropdownMenuTrigger({ asChild, children, ...props }) {
  const { open, setOpen } = React.useContext(DropdownContext);

  const handleClick = (e) => {
    props.onClick?.(e);
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

function DropdownMenuContent({ className, align = "right", children, ...props }) {
  const { open } = React.useContext(DropdownContext);

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-80 zoom-in-95 duration-100",
        align === "right" ? "right-0" : "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ className, children, onClick, ...props }) {
  const { setOpen } = React.useContext(DropdownContext);

  const handleClick = (e) => {
    onClick?.(e);
    setOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuSeparator({ className, ...props }) {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  );
}

function DropdownMenuLabel({ className, ...props }) {
  return (
    <div
      className={cn("px-2.5 py-1 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
