import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Loader2,
  GraduationCap,
  Users,
  Building2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/cutomInput"
import { Button } from "@/components/ui/button"
import { useLogin, useRegister, useOAuthUrl } from "@/hooks/useAuth"
import { useAuthStore } from "@/store/authStore"
import { useProfileStore } from "@/store/profileStore"
import type { UserRole } from "@/types/api"

export const Route = createFileRoute("/auth/")({
  component: RouteComponent,
})

type AuthFormData = {
  fullName?: string
  email: string
  password: string
  rememberMe?: boolean
}

// Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

// GitHub Icon SVG
const GitHubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
)

function RouteComponent() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [selectedRole, setSelectedRole] = useState<UserRole>("STUDENT")
  const [error, setError] = useState<string | null>(null)

  const { isAuthenticated } = useAuthStore()
  const { profile } = useProfileStore()

  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const oAuthMutation = useOAuthUrl()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>()

  // Theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", prefersDark)
      localStorage.setItem("theme", prefersDark ? "dark" : "light")
    }
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (!profile.isProfileComplete) {
        navigate({ to: "/auth/profile" })
      } else {
        navigate({ to: "/dashboard", search: { tab: "dashboard" } })
      }
    }
  }, [isAuthenticated, profile.isProfileComplete, navigate])

  // Reset form when switching between login/signup
  useEffect(() => {
    reset()
    setError(null)
  }, [isLogin, reset])

  const onSubmit = async (data: AuthFormData) => {
    setError(null)

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({
          email: data.email,
          password: data.password,
        })
      } else {
        await registerMutation.mutateAsync({
          email: data.email,
          password: data.password,
          role: selectedRole,
        })
      }
      // Navigation handled by useEffect above
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed. Please try again."
      setError(errorMessage)
    }
  }

  const handleOAuth = (provider: "google" | "github") => {
    oAuthMutation.mutate(provider)
  }

  const isLoading = loginMutation.isPending || registerMutation.isPending || oAuthMutation.isPending

  return (
    <div className="h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-lg overflow-hidden relative z-10"
      >
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-text mb-1.5">
              {isLogin ? "Welcome Back" : "Get Started"}
            </h1>
            <p className="text-xs text-text-secondary">
              {isLogin ? "Sign in to access your dashboard" : "Create your account to begin"}
            </p>
          </div>

          {/* Toggle */}
          <div className="bg-surface/50 p-1.5 rounded-xl flex mb-5 border border-border/50">
            <button
              onClick={() => setIsLogin(true)}
              disabled={isLoading}
              className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                isLogin ? "bg-primary text-white shadow-md" : "text-text-secondary hover:text-text"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              disabled={isLoading}
              className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                !isLogin ? "bg-primary text-white shadow-md" : "text-text-secondary hover:text-text"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {!isLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Input
                  {...register("fullName", {
                    required: !isLogin ? "Full name is required" : false,
                  })}
                  label="Full Name"
                  type="text"
                  placeholder="Enter your full name"
                  icon={<User size={16} />}
                  error={errors.fullName?.message}
                  disabled={isLoading}
                />

                {/* Role Selection */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("STUDENT")}
                      disabled={isLoading}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        selectedRole === "STUDENT"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <GraduationCap
                        size={20}
                        className={
                          selectedRole === "STUDENT" ? "text-primary" : "text-text-secondary"
                        }
                      />
                      <span
                        className={`text-xs mt-1 font-medium ${selectedRole === "STUDENT" ? "text-primary" : "text-text-secondary"}`}
                      >
                        Student
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("PARENT")}
                      disabled={isLoading}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        selectedRole === "PARENT"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Users
                        size={20}
                        className={
                          selectedRole === "PARENT" ? "text-primary" : "text-text-secondary"
                        }
                      />
                      <span
                        className={`text-xs mt-1 font-medium ${selectedRole === "PARENT" ? "text-primary" : "text-text-secondary"}`}
                      >
                        Parent
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("COLLEGE")}
                      disabled={isLoading}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        selectedRole === "COLLEGE"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Building2
                        size={20}
                        className={
                          selectedRole === "COLLEGE" ? "text-primary" : "text-text-secondary"
                        }
                      />
                      <span
                        className={`text-xs mt-1 font-medium ${selectedRole === "COLLEGE" ? "text-primary" : "text-text-secondary"}`}
                      >
                        College
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <Input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              disabled={isLoading}
            />

            <Input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock size={16} />}
              error={errors.password?.message}
              disabled={isLoading}
            />

            {isLogin && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    {...register("rememberMe")}
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                  />
                  <span className="text-text-secondary">Remember me</span>
                </label>
                <a href="#" className="text-primary hover:underline font-medium">
                  Forgot password?
                </a>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" className="w-full" variant="primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-5 text-center text-[10px] text-text-secondary">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </motion.div>
    </div>
  )
}
