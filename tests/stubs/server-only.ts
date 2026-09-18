// Test-only stub. The real "server-only" package throws unconditionally
// unless bundled by Next.js with the "react-server" export condition
// active, which vitest doesn't set. This lets tests import server-only
// modules (apps/web/src/lib/server/*) directly without weakening the
// real protection Next.js enforces at build time for the actual app.
export {};
