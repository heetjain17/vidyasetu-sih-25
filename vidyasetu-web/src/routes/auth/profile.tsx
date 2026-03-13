import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowRight, ArrowLeft, Plus, X, CheckCircle2, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// API URL with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
import { Input } from "@/components/ui/cutomInput"
import { Slider } from "@/components/ui/slider"
import { useProfileStore } from "@/store/profileStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/auth/profile")({
  component: RouteComponent,
})

// J&K localities for dropdown
const LOCALITIES = [
  "Srinagar",
  "Jammu",
  "Anantnag",
  "Baramulla",
  "Pulwama",
  "Kupwara",
  "Budgam",
  "Ganderbal",
  "Bandipora",
  "Shopian",
  "Kulgam",
  "Doda",
  "Kishtwar",
  "Ramban",
  "Reasi",
  "Udhampur",
  "Kathua",
  "Samba",
  "Poonch",
  "Rajouri",
]

// Parent awareness quiz questions
const PARENT_QUIZ_QUESTIONS = [
  {
    id: 1,
    text: "How clearly do you understand your child's strengths, weaknesses, and career interests?",
    options: ["Very clearly", "Somewhat", "Slightly", "Not at all"],
  },
  {
    id: 2,
    text: "How closely do you monitor your child's academic progress?",
    options: ["Very closely", "Sometimes", "Rarely", "Not at all"],
  },
  {
    id: 3,
    text: "How aware are you of career options (traditional + new-age) that match your child's interests?",
    options: ["Very aware", "Somewhat", "Slightly", "Not aware"],
  },
  {
    id: 4,
    text: "How often do you discuss academics and career planning with your child?",
    options: ["Regularly", "Sometimes", "Rarely", "Never"],
  },
  {
    id: 5,
    text: "Are you aware of scholarships and their eligibility for your child's grade/stream?",
    options: ["Very aware", "Somewhat", "Heard of them", "Not aware"],
  },
  {
    id: 6,
    text: "How confident are you in guiding your child toward the right academic and career path?",
    options: ["Very confident", "Somewhat", "Not very", "Not confident"],
  },
]

type ProfileFormData = {
  fullName: string
  gender: string
  locality: string
  category: string
  budget: number
  grade?: string
  board?: string
}

function RouteComponent() {
  const navigate = useNavigate()
  const { isAuthenticated, role, accessToken } = useAuthStore()
  const { profile, updateProfile, markProfileComplete } = useProfileStore()
  const [step, setStep] = useState(1)

  // Parent quiz state
  const [parentAnswers, setParentAnswers] = useState<Record<number, string>>({})
  const [isSavingParent, setIsSavingParent] = useState(false)

  // College profile state
  const [collegeName, setCollegeName] = useState("")
  const [aisheCode, setAisheCode] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [isSavingCollege, setIsSavingCollege] = useState(false)

  // Temporary state for arrays (student)
  const [extracurriculars, setExtracurriculars] = useState<string[]>(profile.extracurriculars || [])
  const [hobbies, setHobbies] = useState<string[]>(profile.hobbies || [])
  const [newExtra, setNewExtra] = useState("")
  const [newHobby, setNewHobby] = useState("")

  // Preferences state (student)
  const [preferences, setPreferences] = useState({
    locality: profile.importanceLocality || 3,
    financial: profile.importanceFinancial || 3,
    eligibility: profile.importanceEligibility || 3,
    eventsHobbies: profile.importanceEventsHobbies || 3,
    quality: profile.importanceQuality || 3,
  })

  const {
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: profile.fullName || "",
      gender: profile.gender || "",
      locality: profile.locality || "",
      category: profile.category || "",
      budget: profile.budget || 100000,
      grade: profile.grade || "",
      board: profile.board || "",
    },
    mode: "onChange",
  })

  const formValues = watch()

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/auth" })
    }
  }, [isAuthenticated, navigate])

  // Register select fields
  useEffect(() => {
    register("gender", { required: true })
    register("locality", { required: true })
    register("category", { required: true })
    register("grade")
    register("board")

    if (profile.gender) setValue("gender", profile.gender)
    if (profile.locality) setValue("locality", profile.locality)
    if (profile.category) setValue("category", profile.category)
    if (profile.grade) setValue("grade", profile.grade)
    if (profile.board) setValue("board", profile.board)
  }, [register, profile, setValue])

  // Step 1: Basic Info
  const onSubmitStep1 = async () => {
    const isValid = await trigger(["fullName", "gender", "locality", "category", "budget"])
    if (isValid && formValues.gender && formValues.locality && formValues.category) {
      updateProfile({
        fullName: formValues.fullName,
        gender: formValues.gender,
        locality: formValues.locality,
        category: formValues.category,
        budget: formValues.budget,
        grade: formValues.grade,
        board: formValues.board,
      })
      setStep(2)
    }
  }

  // Step 2: Extracurriculars & Hobbies
  const onSubmitStep2 = () => {
    updateProfile({
      extracurriculars,
      hobbies,
    })
    setStep(3)
  }

  // Step 3: Preferences - Final Submit (saves to database)
  const onSubmitStep3 = async () => {
    // Update local state first
    updateProfile({
      importanceLocality: preferences.locality,
      importanceFinancial: preferences.financial,
      importanceEligibility: preferences.eligibility,
      importanceEventsHobbies: preferences.eventsHobbies,
      importanceQuality: preferences.quality,
    })

    // Save to database
    try {
      await fetch(`${API_URL}/profile/student`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          full_name: formValues.fullName,
          gender: formValues.gender,
          locality: formValues.locality,
          category: formValues.category,
          budget: formValues.budget,
          grade: formValues.grade,
          board: formValues.board,
          extracurriculars: extracurriculars,
          hobbies: hobbies,
          importance_locality: preferences.locality,
          importance_financial: preferences.financial,
          importance_eligibility: preferences.eligibility,
          importance_events_hobbies: preferences.eventsHobbies,
          importance_quality: preferences.quality,
        }),
      })
    } catch (error) {
      console.error("Failed to save profile to database:", error)
    }

    markProfileComplete()
    navigate({ to: "/assessment/quiz" })
  }

  const addExtra = () => {
    if (newExtra.trim() && !extracurriculars.includes(newExtra.trim())) {
      setExtracurriculars([...extracurriculars, newExtra.trim()])
      setNewExtra("")
    }
  }

  const removeExtra = (item: string) => {
    setExtracurriculars(extracurriculars.filter((e) => e !== item))
  }

  const addHobby = () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()])
      setNewHobby("")
    }
  }

  const removeHobby = (item: string) => {
    setHobbies(hobbies.filter((h) => h !== item))
  }

  const preferenceLabels = {
    locality: "How important is college location to you?",
    financial: "How important is affordability?",
    eligibility: "How important is seat availability for your category?",
    eventsHobbies: "How important are cultural events & activities?",
    quality: "How important is placement & infrastructure quality?",
  }

  // Parent quiz submit handler
  const handleParentSubmit = async () => {
    setIsSavingParent(true)
    try {
      // Save parent profile with quiz answers to backend
      await fetch(`${API_URL}/profile/parent`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          awareness_quiz: parentAnswers,
        }),
      })

      markProfileComplete()
      navigate({ to: "/dashboard", search: { tab: undefined } })
    } catch (error) {
      console.error("Failed to save parent profile:", error)
    } finally {
      setIsSavingParent(false)
    }
  }

  // College profile submit handler
  const handleCollegeSubmit = async () => {
    if (!collegeName.trim()) return

    setIsSavingCollege(true)
    try {
      await fetch(`${API_URL}/profile/college`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          college_name: collegeName,
          aishe_code: aisheCode,
          contact_person: contactPerson,
        }),
      })

      markProfileComplete()
      navigate({ to: "/dashboard", search: { tab: undefined } })
    } catch (error) {
      console.error("Failed to save college profile:", error)
    } finally {
      setIsSavingCollege(false)
    }
  }

  // ========== PARENT PROFILE SETUP ==========
  if (role === "PARENT") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-lg overflow-hidden relative z-10"
        >
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">Parent Awareness Quiz</h1>
              <p className="text-sm text-text-secondary">
                Help us understand your involvement in your child's career journey
              </p>
            </div>

            <div className="space-y-4">
              {PARENT_QUIZ_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="mb-4">
                  <p className="text-sm text-text mb-2">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setParentAnswers({ ...parentAnswers, [q.id]: opt })}
                        className={`px-4 py-2 text-sm rounded-lg border-2 transition-all ${
                          parentAnswers[q.id] === opt
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-text-secondary hover:border-primary/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleParentSubmit}
                disabled={
                  Object.keys(parentAnswers).length < PARENT_QUIZ_QUESTIONS.length || isSavingParent
                }
                className="w-full bg-primary hover:bg-primary/90 text-white text-sm font-bold py-3 rounded-lg shadow-lg hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingParent ? "Saving..." : "Continue to Dashboard"}
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ========== COLLEGE PROFILE SETUP ==========
  if (role === "COLLEGE") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-lg overflow-hidden relative z-10"
        >
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">College Profile</h1>
              <p className="text-sm text-text-secondary">
                Complete your college profile to get started
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">
                  College Name *
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="Enter college name"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">AISHE Code</label>
                <input
                  type="text"
                  value={aisheCode}
                  onChange={(e) => setAisheCode(e.target.value)}
                  placeholder="e.g., C-1234"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Name of primary contact"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCollegeSubmit}
                disabled={!collegeName.trim() || isSavingCollege}
                className="w-full bg-primary hover:bg-primary/90 text-white text-sm font-bold py-3 rounded-lg shadow-lg hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingCollege ? "Saving..." : "Continue to Dashboard"}
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ========== STUDENT PROFILE SETUP (Original) ==========
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-lg overflow-hidden relative z-10"
      >
        <div className="p-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text">Step {step} of 3</span>
              <span className="text-xs text-text-secondary">
                {step === 1 ? "Basic Info" : step === 2 ? "Interests" : "Preferences"}
              </span>
            </div>
            <div className="w-full bg-surface rounded-full h-1.5">
              <motion.div
                className="bg-primary h-1.5 rounded-full"
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold mb-4">Tell us about yourself</h2>

              <Input
                {...register("fullName", { required: "Name is required" })}
                label="Full Name *"
                type="text"
                placeholder="Enter your full name"
                error={errors.fullName?.message}
              />

              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">Gender *</label>
                <Select value={formValues.gender} onValueChange={(v) => setValue("gender", v)}>
                  <SelectTrigger className="w-full h-9 bg-surface text-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">
                  Your City/District *
                </label>
                <Select value={formValues.locality} onValueChange={(v) => setValue("locality", v)}>
                  <SelectTrigger className="w-full h-9 bg-surface text-sm">
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALITIES.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">Category *</label>
                <Select value={formValues.category} onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger className="w-full h-9 bg-surface text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                    <SelectItem value="EWS">EWS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <div>
                <label className="text-xs font-semibold text-text block mb-1.5">
                  Annual Budget (₹) *
                </label>
                <Input
                  {...register("budget", {
                    required: true,
                    valueAsNumber: true,
                  })}
                  type="number"
                  placeholder="e.g., 100000"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Your annual education budget in rupees
                </p>
              </div> */}
            </motion.div>
          )}

          {/* Step 2: Extracurriculars & Hobbies */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-bold">Your Interests</h2>

              {/* Extracurriculars */}
              <div>
                <label className="text-xs font-semibold text-text block mb-2">
                  Extracurricular Activities
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newExtra}
                    onChange={(e) => setNewExtra(e.target.value)}
                    placeholder="e.g., coding, debate"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExtra())}
                  />
                  <Button onClick={addExtra} variant="secondary" size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extracurriculars.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {item}
                      <button onClick={() => removeExtra(item)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Hobbies */}
              <div>
                <label className="text-xs font-semibold text-text block mb-2">Hobbies</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    placeholder="e.g., reading, gaming"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHobby())}
                  />
                  <Button onClick={addHobby} variant="secondary" size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hobbies.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full"
                    >
                      {item}
                      <button onClick={() => removeHobby(item)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-text-secondary">
                These help us match you with colleges that have relevant clubs and events.
              </p>
            </motion.div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-bold">What matters to you?</h2>
              <p className="text-xs text-text-secondary -mt-4">
                Rate each factor from 1 (not important) to 5 (very important)
              </p>

              {(Object.keys(preferenceLabels) as Array<keyof typeof preferences>).map((key) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-text">
                      {preferenceLabels[key]}
                    </label>
                    <span className="text-xs font-bold text-primary">{preferences[key]}/5</span>
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[preferences[key]]}
                    onValueChange={(v) => setPreferences({ ...preferences, [key]: v[0] })}
                    className="w-full"
                  />
                </div>
              ))}
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex gap-2 mt-6">
            {step > 1 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-surface text-text text-sm font-semibold py-2.5 rounded-lg border-2 border-border hover:border-primary transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={step === 1 ? onSubmitStep1 : step === 2 ? onSubmitStep2 : onSubmitStep3}
              className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2.5 rounded-lg shadow-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              {step === 3 ? "Start Assessment" : "Next"}
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
