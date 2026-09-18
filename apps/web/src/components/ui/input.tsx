import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface-elevated px-3.5 text-sm text-foreground placeholder:text-subtle-foreground transition-colors duration-[var(--duration-fast)] focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent/50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-xs font-medium tracking-[0.02em] text-muted-foreground", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface-elevated px-3.5 text-sm text-foreground transition-colors duration-[var(--duration-fast)] focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent/50",
        className,
      )}
      {...props}
    />
  );
}
