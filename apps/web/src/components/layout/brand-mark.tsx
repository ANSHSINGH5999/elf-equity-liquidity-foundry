/** The double-slash mark from the design, in currentColor. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 23 17" aria-hidden="true" className={className} fill="currentColor">
      <path d="M8.15 0.9 L4.55 0.9 L0.5 9.3 L4.1 9.3 Z" />
      <path d="M17.0 0 L13.4 0 L6.15 16.4 L9.75 16.4 Z" />
      <path d="M22.9 0 L19.3 0 L15.0 7.6 L18.6 7.6 Z" />
      <path d="M22.6 6.9 L19.0 6.9 L14.05 16.4 L17.65 16.4 Z" />
    </svg>
  );
}
