"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

interface LithosRevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
  radius: number;
}

/**
 * Shows `image` only inside a soft circle that follows the cursor. A hidden canvas paints a radial gradient (opaque
 * centre, transparent rim) at the cursor, and that bitmap is applied as the reveal div's CSS mask.
 */
export function LithosRevealLayer({ image, cursorX, cursorY, radius }: LithosRevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  // Keep the canvas the size of the viewport.
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // On every render: repaint the gradient at the cursor and apply it as the mask.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !reveal || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, radius);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,1)");
    gradient.addColorStop(0.6, "rgba(255,255,255,0.75)");
    gradient.addColorStop(0.75, "rgba(255,255,255,0.4)");
    gradient.addColorStop(0.88, "rgba(255,255,255,0.12)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, radius, 0, Math.PI * 2);
    ctx.fill();

    const mask = `url(${canvas.toDataURL()})`;
    reveal.style.maskImage = mask;
    reveal.style.webkitMaskImage = mask;
    reveal.style.maskSize = "100% 100%";
    reveal.style.webkitMaskSize = "100% 100%";
  });

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" style={{ display: "none" }} />
      <div
        ref={revealRef}
        className="pointer-events-none absolute inset-0 z-30 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${image}")` }}
      />
    </>
  );
}
