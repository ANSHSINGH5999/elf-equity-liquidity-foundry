/**
 * The design's own poster frame (the video's first frame), fixed behind every
 * inner page and dimmed so dense data stays legible. It is a plain CSS image —
 * no video, no canvas — so inner pages stay light. The landing page plays the
 * real video and hides this layer.
 */
export const HERO_POSTER = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/130837c4-0244-4f37-9c61-8d801d93fd29.jpg";
export const HERO_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104303_0c6d60b2-9353-408e-9449-585108a22fb5.mp4";

export function SiteBackdrop() {
  return (
    <div data-site-chrome aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#02060f]">
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.55]" style={{ backgroundImage: `url(${HERO_POSTER})` }} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,15,0.78)_0%,rgba(2,6,15,0.86)_45%,rgba(2,6,15,0.94)_100%)]" />
    </div>
  );
}
