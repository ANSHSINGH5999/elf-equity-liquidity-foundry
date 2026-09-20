import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-full border border-[rgba(196,214,232,0.28)] bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-subtle-foreground transition-colors duration-[var(--duration-fast)] focus:outline-none focus:border-[#9fe0ff]/70 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#9fe0ff]/50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block px-1 text-xs tracking-[0.02em] text-muted-foreground [font-variation-settings:'wght'_506]", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-full border border-[rgba(196,214,232,0.28)] bg-white/[0.03] px-4 text-sm text-foreground transition-colors duration-[var(--duration-fast)] focus:outline-none focus:border-[#9fe0ff]/70 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#9fe0ff]/50",
        className,
      )}
      {...props}
    />
  );
}
