import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-[0.03em] backdrop-blur-md transition-colors",
  {
    variants: {
      variant: {
        neutral: "bg-surface-elevated text-muted-foreground border border-border-strong",
        accent: "bg-accent-muted text-accent-strong border border-accent/25 shadow-[0_0_12px_-2px_rgba(99,102,241,0.2)]",
        gold: "bg-amber-500/10 text-gold-light border border-amber-500/30 shadow-[0_0_12px_-2px_rgba(201,162,39,0.25)]",
        positive: "bg-positive-muted text-positive border border-positive/30",
        negative: "bg-negative-muted text-negative border border-negative/30",
        warning: "bg-warning-muted text-warning border border-warning/30",
        outline: "border border-border-strong text-muted-foreground bg-transparent",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
