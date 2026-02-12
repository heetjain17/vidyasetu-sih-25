import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import desktopImage from "@/assets/desktop.png";
import mobileImage from "@/assets/mobile.jpg";

export const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative flex items-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl relative z-10"
        >
          {/* blip */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="overflow-hidden whitespace-nowrap mb-4"
          >
            <span className="text-sm md:text-base font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              {t("home.heroTagline", "The AI-powered guidance platform.")}
            </span>
          </motion.div>

          {/* hero text */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            {t("home.heroTitle", "Your future shouldn't depend on")}{" "}
            <span className="text-primary relative inline-block">
              {t("home.heroHighlight", "guesswork")}
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-60"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
              </motion.svg>
            </span>
            .
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-md md:text-lg text-text-secondary mb-8 leading-relaxed"
          >
            {t(
              "home.heroSubtitle",
              "Personalized suggestions with transparent scoring, insights, and explainability."
            )}
          </motion.p>

          {/* buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-text text-background rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-primary hover:text-text transition-colors group"
            >
              {t("home.explorePlatform", "Explore Platform")}{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-surface text-text border border-border rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-sm hover:border-secondary transition-colors group"
            >
              <PlayCircle
                size={20}
                className="group-hover:text-secondary transition-colors"
              />{" "}
              {t("home.seeHow", "See how it works")}
            </motion.button>
          </div>
        </motion.div>

        {/* Right Mockups */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotate: 5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.3, duration: 1, type: "spring" }}
          className="relative hidden lg:block h-[600px] perspective-1000"
        >
          {/* Main Dashboard Mockup */}
          <motion.div
            whileHover={{ rotateY: -5, rotateX: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute top-10 right-0 w-[90%] rounded-xl shadow-2xl border border-border overflow-hidden bg-card z-20"
          >
            <div className="h-8 bg-surface border-b border-border flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="relative overflow-hidden">
              <img
                src={desktopImage}
                alt="Desktop Dashboard Preview"
                className="w-full h-auto object-cover object-top"
                style={{ maxHeight: "350px" }}
              />
            </div>
          </motion.div>

          {/* Mobile Mockup Floating */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute bottom-20 left-0 w-[180px] rounded-[2rem] shadow-2xl border-[8px] border-text bg-background z-30 overflow-hidden"
          >
            <img
              src={mobileImage}
              alt="Mobile App Preview"
              className="w-full h-auto object-cover object-top"
              style={{ maxHeight: "360px" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
