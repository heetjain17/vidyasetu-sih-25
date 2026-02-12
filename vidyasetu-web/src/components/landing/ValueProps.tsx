import React from "react";
import { motion } from "framer-motion";
import {
  Compass,
  GraduationCap,
  BrainCircuit,
  Smartphone,
  BellRing,
  Box,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const ValueProps: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      Icon: Compass,
      name: t("landing.features.careerEngine"),
      description: t("landing.features.careerEngineDesc"),
      cta: t("landing.features.learnMore"),
      gradient: "from-blue-500/20 to-cyan-500/10",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      Icon: GraduationCap,
      name: t("landing.features.collegeMatching"),
      description: t("landing.features.collegeMatchingDesc"),
      cta: t("landing.features.explore"),
      gradient: "from-purple-500/20 to-pink-500/10",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-500",
    },
    {
      Icon: BrainCircuit,
      name: t("landing.features.explainableAI"),
      description: t("landing.features.explainableAIDesc"),
      cta: t("landing.features.discover"),
      gradient: "from-amber-500/20 to-orange-500/10",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-500",
    },
    {
      Icon: Smartphone,
      name: t("landing.features.multiPlatform"),
      description: t("landing.features.multiPlatformDesc"),
      cta: t("landing.features.download"),
      gradient: "from-green-500/20 to-emerald-500/10",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-500",
    },
    {
      Icon: BellRing,
      name: t("landing.features.timeline"),
      description: t("landing.features.timelineDesc"),
      cta: t("actions.getStarted"),
      gradient: "from-rose-500/20 to-red-500/10",
      iconBg: "bg-rose-500/20",
      iconColor: "text-rose-500",
    },
    {
      Icon: Box,
      name: t("landing.features.sandbox"),
      description: t("landing.features.sandboxDesc"),
      cta: t("landing.features.tryIt"),
      gradient: "from-indigo-500/20 to-violet-500/10",
      iconBg: "bg-indigo-500/20",
      iconColor: "text-indigo-500",
    },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-6"
        >
          {t("landing.features.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-text-secondary text-lg"
        >
          {t("landing.features.subtitle")}
        </motion.p>
      </div>

      {/* Equal 3x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative"
          >
            {/* Background glow on hover */}
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`}
            ></div>

            {/* Card */}
            <div
              className={`relative h-full bg-card rounded-2xl border border-border p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-30`}
              ></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.Icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.name}
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* CTA */}
                <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                  {feature.cta}
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </span>
              </div>

              {/* Decorative corner gradient */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
