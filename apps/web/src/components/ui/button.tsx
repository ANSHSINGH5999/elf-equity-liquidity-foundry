import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium tracking-[-0.01em] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-foreground border border-indigo-400/30 shadow-[0_1px_2px_rgba(0,0,0,0.5),0_0_20px_-4px_rgba(99,102,241,0.4)] hover:bg-accent-strong hover:shadow-[0_0_25px_-2px_rgba(99,102,241,0.6)] hover:-translate-y-0.5",
        gold:
          "bg-gradient-to-r from-[#dfb846] via-[#c9a227] to-[#b08b1a] text-[#05070b] font-semibold border border-amber-300/40 shadow-[0_1px_2px_rgba(0,0,0,0.5),0_0_20px_-4px_rgba(201,162,39,0.4)] hover:shadow-[0_0_28px_-2px_rgba(201,162,39,0.6)] hover:-translate-y-0.5",
        secondary:
          "bg-surface-elevated text-foreground border border-border-strong hover:bg-surface-hover hover:border-white/20 hover:-translate-y-0.5",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-surface-hover/60",
        destructive: "bg-negative-muted text-negative border border-negative/30 hover:bg-negative/20",
        outline: "border border-border-strong text-foreground bg-transparent hover:bg-surface-hover hover:border-white/20",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-sm font-semibold",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
