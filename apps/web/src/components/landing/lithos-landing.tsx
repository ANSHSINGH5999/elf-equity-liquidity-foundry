import { LithosHero } from "@/components/landing/lithos-hero";
import { LandingSections } from "@/components/landing/landing-sections";

const FONTS = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500;1,600&display=swap";

/** The home page: the Lithos hero design, followed by the content sections. */
export function LithosLanding() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS} precedence="default" />
      <LithosHero />
      <LandingSections />
    </>
  );
}
