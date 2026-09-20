import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[13px] tracking-[-0.01em] [font-variation-settings:'wght'_531] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9fe0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.985]",
  {
    variants: {
      variant: {
        // The design's CTA: warm-left / cool-right glass with a gradient hairline.
        primary: "glass-pill text-white hover:brightness-125",
        gold: "glass-pill text-[#ffe2b2] hover:brightness-125",
        secondary: "hair-pill bg-white/[0.04] text-[#e8ecf0] hover:bg-white/[0.10] hover:text-white",
        ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
        destructive: "border border-negative/40 bg-negative-muted text-negative hover:bg-negative/20",
        outline: "hair-pill bg-transparent text-foreground hover:bg-white/[0.08]",
      },
      size: {
        sm: "h-8 px-4 text-xs",
        md: "h-10 px-6",
        lg: "h-12 px-8 text-sm",
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
