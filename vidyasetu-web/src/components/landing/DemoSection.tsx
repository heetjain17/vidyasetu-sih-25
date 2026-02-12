import React from "react";
import { motion } from "framer-motion";
import { HeroVideoDialog } from "../ui/hero-video-dialog";
import { useTranslation } from "react-i18next";

export const DemoSection: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    t("landing.demo.step1"),
    t("landing.demo.step2"),
    t("landing.demo.step3"),
    t("landing.demo.step4"),
  ];

  return (
    <section id="demo" className=" overflow-hidden ">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            {t("landing.demo.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-secondary"
          >
            {t("landing.demo.subtitle")}
          </motion.p>
        </div>

        {/* Two Column Layout: Steps + Video */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Steps - Takes 5 columns */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-4 group cursor-default"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 text-text font-bold text-lg flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-colors duration-300 shrink-0">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-xl group-hover:text-primary transition-colors">
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg"
            >
              <p className="text-text-secondary italic">
                "{t("landing.demo.quote")}"
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Video Preview - Takes 7 columns */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <HeroVideoDialog
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/vJkpoOVwUbA"
              thumbnailSrc="/thumbnail.png"
              thumbnailAlt="Platform Demo Video"
              className="w-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
