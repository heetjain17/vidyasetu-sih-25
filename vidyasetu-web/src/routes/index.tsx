import { createFileRoute } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Hero } from "../components/landing/HeroSection"
import { Navbar } from "../components/landing/Navbar"
import { ValueProps } from "../components/landing/ValueProps"
import { DemoSection } from "../components/landing/DemoSection"
import { TargetAudience } from "../components/landing/TargetAudience"
import { Architecture } from "../components/landing/Architecture"
import { Testimonials } from "../components/landing/Testimonals"
import { Footer } from "../components/landing/Footer"
import { SampleReport } from "../components/landing/SampleReport"
import { BackgroundEffects } from "../components/landing/BackgroundEffects"

export const Route = createFileRoute("/")({
  component: Index,
})

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
  | "combined"

function Index() {
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("theme") || "dark"
  })

  const [backgroundEffect] = useState<BackgroundEffect>("dot-grid")
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Apply theme on mount
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  // Track mouse position for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <BackgroundEffects effect={backgroundEffect} mousePos={mousePos} />

      {/* Navbar - Full Width */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* Main Content - Max Width Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="pt-30" />
        <Hero />
        <div className="max-w-6xl mx-auto">
          <div className="pt-10" />
          <ValueProps />
          <div className="pt-20" />
          <DemoSection />
          <div className="pt-20" />
          <SampleReport />
          <div className="pt-20" />
          <TargetAudience />
          <Architecture />
          <Testimonials />
        </div>
      </div>
      <div className="pt-20" />
      <Footer />
    </div>
  )
}
