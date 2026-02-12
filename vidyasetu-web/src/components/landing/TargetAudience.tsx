import React from "react";
import { motion } from "framer-motion";
import { User, Users, Check, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export const TargetAudience: React.FC = () => {
  const { t } = useTranslation();

  const studentPoints = [
    t("landing.audience.studentPoint1"),
    t("landing.audience.studentPoint2"),
    t("landing.audience.studentPoint3"),
  ];

  const parentPoints = [
    t("landing.audience.parentPoint1"),
    t("landing.audience.parentPoint2"),
    t("landing.audience.parentPoint3"),
  ];

  return (
    <section className="relative ">
      {/* Animated Glowing Blobs Background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {/* Top Right Glow */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-10 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px]"
        />

        {/* Bottom Left Glow */}
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-20 left-10 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px]"
        />

        {/* Center Accent Glow */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[150px]"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block"
          >
            {t("landing.audience.tagline")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold"
          >
            {t("landing.audience.title")}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Student Card - Modern Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-card rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              {/* Icon Badge */}
              <div className="absolute -top-6 left-8">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <User size={28} className="text-background" />
                </div>
              </div>

              {/* Content */}
              <div className="pt-6">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t("landing.audience.forStudents")}
                </h3>

                <div className="space-y-4 mb-8">
                  {studentPoints.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1 shrink-0">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check
                            size={12}
                            className="text-primary"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                      <p className="text-text-secondary leading-relaxed">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-primary font-semibold group/btn"
                >
                  <span>{t("landing.audience.learnHow")}</span>
                  <ArrowRight
                    size={18}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </motion.button>
              </div>

              {/* Decorative Corner */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full"></div>
            </div>
          </motion.div>

          {/* Parent Card - Modern Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary to-accent rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-card rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              {/* Icon Badge */}
              <div className="absolute -top-6 left-8">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Users size={28} className="text-background" />
                </div>
              </div>

              {/* Content */}
              <div className="pt-6">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  {t("landing.audience.forParents")}
                </h3>

                <div className="space-y-4 mb-8">
                  {parentPoints.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1 shrink-0">
                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                          <Check
                            size={12}
                            className="text-secondary"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                      <p className="text-text-secondary leading-relaxed">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-secondary font-semibold group/btn"
                >
                  <span>{t("landing.audience.readGuide")}</span>
                  <ArrowRight
                    size={18}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </motion.button>
              </div>

              {/* Decorative Corner */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-secondary/5 to-transparent rounded-tl-full"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
