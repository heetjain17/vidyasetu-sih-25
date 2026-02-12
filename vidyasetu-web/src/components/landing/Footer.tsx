import React from "react";
import { motion } from "framer-motion";
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const socialIconVariants = {
    hover: { y: -3, scale: 1.1, color: "var(--color-primary)" },
    tap: { scale: 0.9 },
  };

  const linkVariants = {
    hover: { x: 5, color: "var(--color-text)" },
  };

  const platformLinks = [
    t("landing.footer.features"),
    t("landing.footer.assessment"),
    t("landing.footer.pricing"),
    t("landing.footer.forSchools"),
  ];

  const companyLinks = [
    t("landing.footer.aboutUs"),
    t("landing.footer.careers"),
    t("landing.footer.blog"),
    t("landing.footer.press"),
  ];

  const supportLinks = [
    t("landing.footer.helpCenter"),
    t("landing.footer.terms"),
    t("landing.footer.privacy"),
    t("landing.footer.contact"),
  ];

  return (
    <footer className="bg-text dark:bg-black text-background dark:text-gray-300 pt-20 pb-10 transition-colors duration-300">
      <div className="container mx-auto px-6">
        {/* CTA Section */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-700 pb-16 mb-12 gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {t("landing.footer.ctaTitle")}
            </h2>
            <p className="text-gray-400 dark:text-gray-400">
              {t("landing.footer.ctaSubtitle")}
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              onClick={() => navigate({ to: "/auth" })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-primary text-text font-bold rounded-lg hover:bg-white transition-colors"
            >
              {t("actions.getStarted")}
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(100,100,100,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 border border-gray-600 text-white font-bold rounded-lg transition-colors"
            >
              {t("landing.footer.bookDemo")}
            </motion.button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-text font-bold text-xs">
                P
              </div>
              <span className="font-bold text-lg">PathFinder AI</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
              {t("landing.footer.brandDesc")}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-primary">
              {t("landing.footer.platform")}
            </h4>
            <ul className="space-y-3 text-gray-400 dark:text-gray-400 text-sm">
              {platformLinks.map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    className="hover:text-white transition-colors block"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-primary">
              {t("landing.footer.company")}
            </h4>
            <ul className="space-y-3 text-gray-400 dark:text-gray-400 text-sm">
              {companyLinks.map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    className="hover:text-white transition-colors block"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-primary">
              {t("landing.footer.support")}
            </h4>
            <ul className="space-y-3 text-gray-400 dark:text-gray-400 text-sm">
              {supportLinks.map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    className="hover:text-white transition-colors block"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700 text-sm text-gray-500 dark:text-gray-600">
          <p>
            &copy; {new Date().getFullYear()} {t("landing.footer.copyright")}
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <motion.a
              href="#"
              variants={socialIconVariants}
              whileHover="hover"
              whileTap="tap"
              className="hover:text-white transition-colors"
            >
              <Twitter size={20} />
            </motion.a>
            <motion.a
              href="#"
              variants={socialIconVariants}
              whileHover="hover"
              whileTap="tap"
              className="hover:text-white transition-colors"
            >
              <Instagram size={20} />
            </motion.a>
            <motion.a
              href="#"
              variants={socialIconVariants}
              whileHover="hover"
              whileTap="tap"
              className="hover:text-white transition-colors"
            >
              <Linkedin size={20} />
            </motion.a>
            <motion.a
              href="#"
              variants={socialIconVariants}
              whileHover="hover"
              whileTap="tap"
              className="hover:text-white transition-colors"
            >
              <Mail size={20} />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
};
