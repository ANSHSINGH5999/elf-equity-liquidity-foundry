import { cn } from "@/lib/utils";

export function Progress({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-accent to-emerald-400 transition-[width] duration-700 ease-[var(--ease-premium)]",
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
