"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";

/** 3D Spline representation of a Meteora Dynamic Bonding Curve */
function DynamicCurveModel({ preset = "balanced" }: { preset?: "conservative" | "balanced" | "growth" }) {
  const groupRef = React.useRef<THREE.Group>(null!);
  const curveMeshRef = React.useRef<THREE.Mesh>(null!);

  // Curve profile coordinates based on Meteora DBC exponential graduation
  const points = React.useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 30;
    const exponent = preset === "conservative" ? 1.4 : preset === "growth" ? 2.5 : 1.9;
    
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = (t - 0.5) * 6; // from -3 to +3
      const y = Math.pow(t, exponent) * 2.8 - 1.2; // curve upwards
      const z = Math.sin(t * Math.PI) * 0.8 - 0.4;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [preset]);

  const curve = React.useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const tubeGeometry = React.useMemo(() => new THREE.TubeGeometry(curve, 64, 0.045, 12, false), [curve]);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Smooth idle tilt
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      state.pointer.x * 0.4 + 0.2,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -state.pointer.y * 0.3 - 0.1,
      0.05
    );
  });

  // Key landmark positions on curve
  const startPos = points[0];
  const midPos = points[Math.floor(points.length * 0.5)];
  const gradPos = points[points.length - 1];

  return (
    <group ref={groupRef}>
      {/* Main Bonding Curve Tube */}
      <mesh ref={curveMeshRef} geometry={tubeGeometry}>
        <meshStandardMaterial
          color="#c9a227"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Grid Reference Floor Lines */}
      <gridHelper
        args={[8, 12, "#182033", "#0f1422"]}
        position={[0, -1.3, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Start Node: Launch Base Mint */}
      <mesh position={startPos}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#818cf8" emissive="#6366f1" emissiveIntensity={1} />
        <Html position={[0, -0.25, 0]} center distanceFactor={8}>
          <div className="pointer-events-none rounded border border-indigo-500/40 bg-[#0c101a]/90 px-2 py-0.5 font-mono text-[9px] text-indigo-300 shadow backdrop-blur whitespace-nowrap">
            Launch ($P₀)
          </div>
        </Html>
      </mesh>

      {/* Midpoint Node: Active Liquidity Zone */}
      <mesh position={midPos}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#f0d58a" emissive="#c9a227" emissiveIntensity={0.8} />
        <Html position={[0, 0.28, 0]} center distanceFactor={8}>
          <div className="pointer-events-none rounded border border-amber-500/40 bg-[#0c101a]/90 px-2 py-0.5 font-mono text-[9px] text-amber-300 shadow backdrop-blur whitespace-nowrap">
            DBC Dynamic Fee Zone
          </div>
        </Html>
      </mesh>

      {/* Graduation Node: DAMM v2 Migration Threshold */}
      <mesh position={gradPos}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={1.2} />
        <Html position={[0, 0.3, 0]} center distanceFactor={8}>
          <div className="pointer-events-none rounded border border-emerald-500/40 bg-[#0c101a]/90 px-2 py-0.5 font-mono text-[9px] text-emerald-300 shadow backdrop-blur whitespace-nowrap">
            DAMM v2 Graduation Target
          </div>
        </Html>
      </mesh>

      {/* Floating Liquidity Rings along the curve */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh position={[startPos.x + 1, startPos.y + 0.3, startPos.z]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.24, 32]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[midPos.x + 0.5, midPos.y + 0.4, midPos.z]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial color="#c9a227" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[gradPos.x - 0.5, gradPos.y + 0.2, gradPos.z]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.46, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </Float>
    </group>
  );
}

// React's own documented pattern for a value that only exists once mounted
// on the client (https://react.dev/reference/react/useSyncExternalStore) —
// avoids a synchronous setState-in-effect call while producing the exact
// same `false` (server/initial render) -> `true` (after mount) transition
// the previous useState+useEffect version did.
function subscribeNoop() {
  return () => {};
}
function getMountedSnapshot() {
  return true;
}
function getMountedServerSnapshot() {
  return false;
}

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

export function BondingCurve3D({ preset = "balanced" }: { preset?: "conservative" | "balanced" | "growth" }) {
  const mounted = React.useSyncExternalStore(subscribeNoop, getMountedSnapshot, getMountedServerSnapshot);
  const reducedMotion = React.useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);

  if (!mounted) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-2xl border border-white/5 bg-[#080b12] text-xs text-muted-foreground">
        Initializing 3D Market Space…
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className="relative flex h-[360px] w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0a0e18] p-6">
        <div className="font-display text-xl text-gold-light">Meteora Dynamic Bonding Curve</div>
        <div className="mt-2 text-xs text-muted-foreground">
          Deterministic price discovery from Launch ($P₀) to DAMM v2 Graduation Target.
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c101a] to-[#06080e] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
      {/* Subtle top indicator */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-[#0c101a]/80 px-3 py-1 text-[11px] font-mono text-muted-foreground backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#c9a227]" />
        <span>3D Curve Model: {preset.toUpperCase()}</span>
      </div>

      <div className="absolute right-4 top-4 z-10 text-[10px] font-mono text-subtle-foreground">
        Tilt / Drag to inspect
      </div>

      <Canvas
        camera={{ position: [0, 0.8, 5.5], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 6, 4]} intensity={1.5} color="#f0d58a" />
        <pointLight position={[-6, -4, -3]} intensity={1.2} color="#6366f1" />
        <DynamicCurveModel preset={preset} />
      </Canvas>
    </div>
  );
}
