import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type BackgroundEffect =
  | "none"
  | "dot-grid"
  | "grid-lines"
  | "gradient-mesh"
  | "animated-grid"
  | "noise-texture"
  | "hexagon"
  | "spotlight"
  | "waves"
  | "combined";

interface BackgroundEffectsProps {
  effect: BackgroundEffect;
  mousePos?: { x: number; y: number };
}

export function BackgroundEffects({
  effect,
  mousePos = { x: 0, y: 0 },
}: BackgroundEffectsProps) {
  if (effect === "none") return null;

  return (
    <>
      {/* DOT GRID */}
      {effect === "dot-grid" && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.12) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      )}

      {/* GRID LINES */}
      {effect === "grid-lines" && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      )}

      {/* GRADIENT MESH */}
      {effect === "gradient-mesh" && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
        </div>
      )}

      {/* ANIMATED GRID */}
      {effect === "animated-grid" && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      )}

      {/* NOISE TEXTURE */}
      {effect === "noise-texture" && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/5" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}

      {/* HEXAGON PATTERN */}
      {effect === "hexagon" && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%233b82f6' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 52px",
            }}
          />
        </div>
      )}

      {/* SPOTLIGHT (Interactive) */}
      {effect === "spotlight" && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`,
          }}
        />
      )}

      {/* WAVES */}
      {effect === "waves" && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/5" />
          <svg className="absolute bottom-0 w-full h-64 opacity-5">
            <path
              d="M0,64 Q160,32 320,64 T640,64 T960,64 T1280,64 T1600,64 V128 H0 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}

      {/* COMBINED (Grid + Gradient + Noise) */}
      {effect === "combined" && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Gradient base */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />

          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}
    </>
  );
}

interface BackgroundSelectorProps {
  currentEffect: BackgroundEffect;
  onEffectChange: (effect: BackgroundEffect) => void;
}

export function BackgroundSelector({
  currentEffect,
  onEffectChange,
}: BackgroundSelectorProps) {
  const effects: { value: BackgroundEffect; label: string }[] = [
    { value: "none", label: "None" },
    { value: "dot-grid", label: "Dot Grid" },
    { value: "grid-lines", label: "Grid Lines" },
    { value: "gradient-mesh", label: "Gradient Mesh" },
    { value: "animated-grid", label: "Animated Grid" },
    { value: "noise-texture", label: "Noise Texture" },
    { value: "hexagon", label: "Hexagon Pattern" },
    { value: "spotlight", label: "Spotlight (Move Mouse)" },
    { value: "waves", label: "Waves" },
    { value: "combined", label: "Combined Effect" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card/90 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-4">
      <p className="text-xs font-semibold text-text-secondary mb-3 text-center">
        🎨 Background Effect Selector
      </p>
      <div className="flex flex-wrap gap-2 max-w-2xl">
        {effects.map((effect) => (
          <button
            key={effect.value}
            onClick={() => onEffectChange(effect.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentEffect === effect.value
                ? "bg-primary text-white shadow-md"
                : "bg-surface text-text-secondary hover:bg-surface/80 hover:text-text"
            }`}
          >
            {effect.label}
          </button>
        ))}
      </div>
    </div>
  );
}
