"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext({
  value: "",
  onValueChange: () => {},
});

function Tabs({ defaultValue, value, onValueChange, className, children, ...props }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;
  const setActiveValue = isControlled ? onValueChange : setInternalValue;

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: setActiveValue }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ value, className, children, ...props }) {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-card text-foreground shadow-xs font-semibold"
          : "hover:bg-background/50 hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, children, ...props }) {
  const { value: activeValue } = React.useContext(TabsContext);
  if (activeValue !== value) return null;

  return (
    <div
      className={cn("mt-4 focus-visible:outline-none animate-in fade-in-50 duration-150", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
