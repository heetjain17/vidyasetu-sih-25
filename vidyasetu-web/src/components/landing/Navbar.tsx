import React, { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import darkBgLogo from "@/assets/darkbg_icon.png";
import lightBgLogo from "@/assets/lightbg_icon.png";

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 rounded-full transition-all duration-300 mx-auto  ${
        isScrolled
          ? "bg-background  shadow-lg py-3 mt-5 max-w-6xl px-6"
          : "py-5  max-w-7xl px-12"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={theme === "dark" ? darkBgLogo : lightBgLogo}
            alt="Margadarshaka Logo"
            className="h-10 w-auto"
          />
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="p-2 transition-colors"
            aria-label="Toggle theme"
            whileHover={{ rotate: 15, scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: -15 }}
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-primary" />
            ) : (
              <Moon size={20} />
            )}
          </motion.button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          <motion.button
            onClick={() => navigate({ to: "/auth" })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2 rounded-full bg-text text-background font-semibold hover:bg-primary hover:text-text transition-all shadow-md"
          >
            {t("landing.navbar.getStarted")}
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-text/5 dark:hover:bg-white/10 transition-colors"
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-primary" />
            ) : (
              <Moon size={20} />
            )}
          </motion.button>
          <motion.button
            className="text-text"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-6 shadow-xl flex flex-col gap-4 overflow-hidden"
          >
            {/* Language Switcher in Mobile Menu */}
            <div className="py-2">
              <LanguageSwitcher />
            </div>

            <motion.button
              onClick={() => {
                navigate({ to: "/auth" });
                setIsMobileMenuOpen(false);
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg bg-text text-background font-bold"
            >
              {t("landing.navbar.getStarted")}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
