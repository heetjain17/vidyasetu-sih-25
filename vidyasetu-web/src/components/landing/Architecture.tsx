import React from "react";
import { motion } from "framer-motion";
import {
  Database,
  Cpu,
  Route,
  MapPin,
  FileText,
  Sparkles,
  Brain,
} from "lucide-react";

export const Architecture: React.FC = () => {
  const steps = [
    { id: 1, label: "Assessment", icon: FileText, desc: "Psychometric inputs" },
    {
      id: 2,
      label: "Vector Scoring",
      icon: Database,
      desc: "Multi-dim analysis",
    },
    { id: 3, label: "RIASEC Mapping", icon: Cpu, desc: "Personality coding" },
    { id: 4, label: "Career Match", icon: Route, desc: "Similarity engine" },
    { id: 5, label: "College Match", icon: MapPin, desc: "Geo-filtering" },
    { id: 6, label: "Explanation", icon: Brain, desc: "Generative logic" },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Dark mode gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Powered by <span className="text-primary">structured logic</span>.
            </h2>
            <p className="text-xl text-text-secondary">
              We don't just guess. Our engine follows a transparent, multi-step
              pipeline to ensure every recommendation is explainable and
              accurate.
            </p>
          </motion.div>
        </div>

        {/* Desktop Pipeline Visualization (MD+) */}
        <div className="hidden md:block relative max-w-6xl mx-auto">
          {/* SVG Layer for Continuous Flowing Line */}
          <svg
            className="absolute left-0 top-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Continuous flowing path from Step 1 to Step 6 to Final Box */}
            {/* Base path (solid background) */}
            <motion.path
              d="M 14 11 
                L 50 11 
                L 85 11 
                C 86 11 87 12 87 13 
                L 87 44 
                C 87 44 86 44 85 44 
                L 50 44 
                L 11 44 
                C 11 44 11 44 11 44 
                L 11 44 
                L 11 78
                Q 11 83, 16 83
                L 83.5 83"
              strokeWidth="0.4"
              stroke="var(--color-border)"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
              vectorEffect="non-scaling-stroke"
            />

            {/* Continuously flowing dashed lines */}
            <motion.path
              d="
                M 14 11 
                L 50 11 
                L 85 11 
                C 86 11 87 12 87 13 
                L 87 45 
                C 87 45 86 45 85 45 
                L 50 45 
                L 11 45 
                C 11 45 11 45 11 45 
                L 11 45 
                L 11 78
                Q 11 83, 16 83
                L 83.5 83"
              strokeWidth="0.8"
              stroke="var(--color-text)"
              fill="none"
              filter="url(#glow)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 8"
              animate={{
                strokeDashoffset: [0, -12],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              vectorEffect="non-scaling-stroke"
            />

            {/* Animated dot traveling along the path - continuous loop */}
            <motion.circle
              r="1.5"
              fill="var(--color-primary)"
              filter="url(#glow)"
              animate={{
                offsetDistance: ["0%", "100%"],
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.1, 0.5, 0.9, 1],
              }}
              style={{
                offsetPath:
                  "path('M 14 11 L 50 11 L 85 11 C 86 11 87 12 87 13 L 87 45 C 87 45 86 45 85 45 L 50 45 L 11 45 C 11 45 11 45 11 45 L 11 45 L 11 78 Q 11 83, 16 83 L 83.5 83')",
              }}
              vectorEffect="non-scaling-stroke"
            />

            {/* Multiple energy particles for more dynamic effect */}
            {[0, 1, 2].map((index) => (
              <motion.circle
                key={index}
                r="0.8"
                fill="var(--color-primary)"
                opacity="0.6"
                animate={{
                  offsetDistance: ["0%", "100%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 1.3,
                }}
                style={{
                  offsetPath:
                    "path('M 14 11 L 50 11 L 85 11 C 86 11 87 12 87 13 L 87 45 C 87 45 86 45 85 45 L 50 45 L 11 45 C 11 45 11 45 11 45 L 11 45 L 11 78 Q 11 83, 16 83 L 83.5 83')",
                }}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* Beam effect connecting to final card on the right */}
          {/* <motion.div
            className="absolute right-[8.5%] w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent"
            style={{
              top: "66%",
              height: "20%",
              zIndex: 5,
              filter: "blur(1px)",
            }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
              scaleY: [0, 1, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.3, 0.7, 1],
            }}
          /> */}

          {/* Energy beam glow */}
          {/* <motion.div
            className="absolute right-[8.5%] w-8 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent blur-xl"
            style={{
              top: "66%",
              height: "20%",
              zIndex: 4,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          /> */}

          {/* Step Cards Layout */}
          <div className="relative" style={{ zIndex: 10 }}>
            {/* Row 1: Steps 1, 2, 3 */}
            <div className="grid grid-cols-3 gap-x-32 mb-20">
              <NodeCard step={steps[0]} index={0} position="left" />
              <NodeCard step={steps[1]} index={1} position="center" />
              <NodeCard step={steps[2]} index={2} position="right" />
            </div>

            {/* Row 2: Steps 4, 5, 6 (reversed visual order) */}
            <div className="grid grid-cols-3 gap-x-32 mb-20">
              <NodeCard step={steps[5]} index={5} position="left" />
              <NodeCard step={steps[4]} index={4} position="center" />
              <NodeCard step={steps[3]} index={3} position="right" />
            </div>

            {/* Final Big Box with Power-Up Effect - Right Aligned */}
            <div className="flex justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="w-full max-w-2xl bg-card border-2 border-primary/30 rounded-2xl p-8 relative shadow-2xl overflow-hidden"
              >
                {/* Charging energy background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                ></motion.div>

                {/* Animated border glow - power charging effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: "0 0 0 2px var(--color-primary)",
                  }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    boxShadow: [
                      "0 0 5px 1px rgba(var(--color-primary-rgb), 0.3)",
                      "0 0 20px 2px var(--color-primary)",
                      "0 0 5px 1px rgba(var(--color-primary-rgb), 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                ></motion.div>

                {/* Energy rings expanding */}
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0 rounded-2xl border-2 border-primary"
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{
                      scale: [1, 1.05, 1.1],
                      opacity: [0.4, 0.2, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: index * 2,
                    }}
                  />
                ))}

                {/* Charging particles */}
                {[...Array(8)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="absolute w-1 h-1 bg-primary rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5,
                    }}
                  />
                ))}

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  {/* Icon with power glow */}
                  <motion.div
                    className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0 relative"
                    animate={{
                      boxShadow: [
                        "0 0 10px rgba(var(--color-primary-rgb), 0.3)",
                        "0 0 25px var(--color-primary)",
                        "0 0 10px rgba(var(--color-primary-rgb), 0.3)",
                      ],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles size={40} className="text-primary" />
                    {/* Icon glow rings */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-primary"
                      animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  </motion.div>

                  <div className="flex-1">
                    <motion.h3
                      className="text-2xl font-bold mb-2"
                      animate={{
                        textShadow: [
                          "0 0 5px rgba(var(--color-primary-rgb), 0)",
                          "0 0 15px var(--color-primary)",
                          "0 0 5px rgba(var(--color-primary-rgb), 0)",
                        ],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      Personalized Career Roadmap
                    </motion.h3>
                    <p className="text-text-secondary">
                      The final output combines all scoring vectors to produce a
                      ranked list of careers, compatible colleges, and a
                      detailed "Why?" explanation for each match.
                    </p>
                  </div>
                  <div className="md:ml-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        boxShadow: [
                          "0 4px 6px rgba(0,0,0,0.1)",
                          "0 8px 16px rgba(var(--color-primary-rgb), 0.3)",
                          "0 4px 6px rgba(0,0,0,0.1)",
                        ],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="px-6 py-3 bg-primary text-text font-bold rounded-lg shadow-lg hover:bg-opacity-90 transition-all whitespace-nowrap relative overflow-hidden"
                    >
                      {/* Button shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: ["-100%", "200%"],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <span className="relative">View Sample Report</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Pipeline (Vertical Stack) */}
        <div className="md:hidden space-y-6 relative">
          {/* Continuous vertical line */}
          <svg
            className="absolute left-8 top-0 w-1 h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <motion.line
              x1="2"
              y1="0"
              x2="2"
              y2="100%"
              stroke="var(--color-border)"
              strokeWidth="2"
              opacity="0.3"
            />
            <motion.line
              x1="2"
              y1="0"
              x2="2"
              y2="100%"
              stroke="var(--color-primary)"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              viewport={{ once: true }}
            />
          </svg>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex gap-4 items-center bg-card p-4 rounded-xl border-2 border-border shadow-sm relative overflow-hidden ml-0"
              style={{ zIndex: 10 }}
            >
              <div className="w-16 h-16 rounded-lg bg-surface flex items-center justify-center shrink-0 border-2 border-primary z-10 relative">
                <step.icon size={24} className="text-primary" />
              </div>
              <div>
                <div className="text-xs font-bold text-primary uppercase mb-1">
                  Step {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-bold text-lg">{step.label}</h3>
                <p className="text-sm text-text-secondary">{step.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* Mobile Final Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/10 p-6 rounded-xl border border-primary/50 text-center mt-8 ml-0"
            style={{ zIndex: 10 }}
          >
            <Sparkles size={32} className="mx-auto text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Final Roadmap</h3>
            <p className="text-sm text-text-secondary mb-4">
              Ranked careers & college matches with detailed explanations.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-primary text-text font-bold rounded-lg text-sm"
            >
              View Sample
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Helper Component for Desktop Cards
const NodeCard: React.FC<{
  step: { id: number; label: string; icon: any; desc: string };
  index: number;
  position: "left" | "center" | "right";
}> = ({ step, index, position }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      whileHover={{
        y: -8,
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.2)",
      }}
      className="relative w-full h-44 bg-card rounded-2xl border-2 border-border hover:border-primary p-6 flex flex-col items-center justify-center text-center shadow-lg group transition-all duration-300"
    >
      {/* Connection indicator dot */}
      <motion.div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ delay: index * 0.15 + 0.2 }}
        viewport={{ once: true }}
      />

      <div className="w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mb-3 border border-primary/20">
        <step.icon size={28} className="text-primary" />
      </div>

      <div className="text-xs font-mono text-primary mb-2 font-bold tracking-wider">
        STEP {String(step.id).padStart(2, "0")}
      </div>

      <h4 className="font-bold text-xl leading-tight mb-2">{step.label}</h4>
      <p className="text-sm text-text-secondary">{step.desc}</p>

      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </motion.div>
  );
};
