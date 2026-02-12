import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Heart,
  Sliders,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getStudentProfile,
  updateStudentProfile,
  type StudentProfile,
  type StudentProfileUpdate,
} from "@/api/profileApi";

// ============================================================
// Constants
// ============================================================

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const CATEGORY_OPTIONS = ["General", "OBC", "SC", "ST", "EWS"];
const GRADE_OPTIONS = ["9th", "10th", "11th", "12th", "Graduate"];
const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "IB", "Other"];

const HOBBY_SUGGESTIONS = [
  "Reading",
  "Sports",
  "Music",
  "Art",
  "Gaming",
  "Photography",
  "Cooking",
  "Travel",
  "Writing",
  "Dance",
  "Coding",
  "Gardening",
];

const EXTRACURRICULAR_SUGGESTIONS = [
  "Debate Club",
  "Sports Team",
  "Music Band",
  "Drama Club",
  "Science Club",
  "Volunteer Work",
  "Student Council",
  "NCC/NSS",
  "Quiz Team",
  "Art Club",
  "Robotics",
  "Environmental Club",
];

// Districts for J&K
const DISTRICTS = [
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
];

// ============================================================
// Component
// ============================================================

export function StudentProfileModule() {
  const [_profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<StudentProfileUpdate>({});
  const [newHobby, setNewHobby] = useState("");
  const [newExtracurricular, setNewExtracurricular] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentProfile();
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        gender: data.gender || "",
        phone: data.phone || "",
        locality: data.locality || "",
        district: data.district || "",
        state: data.state || "",
        category: data.category || "",
        grade: data.grade || "",
        board: data.board || "",
        school_name: data.school_name || "",
        budget: data.budget || 100000,
        hobbies: data.hobbies || [],
        extracurriculars: data.extracurriculars || [],
        importance_locality: data.importance_locality || 3,
        importance_financial: data.importance_financial || 3,
        importance_eligibility: data.importance_eligibility || 3,
        importance_events_hobbies: data.importance_events_hobbies || 3,
        importance_quality: data.importance_quality || 3,
      });
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await updateStudentProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof StudentProfileUpdate, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addHobby = (hobby: string) => {
    if (hobby && !formData.hobbies?.includes(hobby)) {
      updateField("hobbies", [...(formData.hobbies || []), hobby]);
    }
    setNewHobby("");
  };

  const removeHobby = (hobby: string) => {
    updateField("hobbies", formData.hobbies?.filter((h) => h !== hobby) || []);
  };

  const addExtracurricular = (activity: string) => {
    if (activity && !formData.extracurriculars?.includes(activity)) {
      updateField("extracurriculars", [
        ...(formData.extracurriculars || []),
        activity,
      ]);
    }
    setNewExtracurricular("");
  };

  const removeExtracurricular = (activity: string) => {
    updateField(
      "extracurriculars",
      formData.extracurriculars?.filter((e) => e !== activity) || []
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-text-secondary">
            Manage your personal information and preferences
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Saving..." : "Update Profile"}
        </motion.button>
      </div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400"
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400"
        >
          <CheckCircle className="w-5 h-5" />
          Profile saved successfully!
        </motion.div>
      )}

      {/* Personal Information */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name || ""}
              onChange={(e) => updateField("full_name", e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Gender
            </label>
            <Select
              value={formData.gender || ""}
              onValueChange={(v) => updateField("gender", v)}
            >
              <SelectTrigger className="w-full h-12 bg-surface text-sm rounded-xl">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              District
            </label>
            <Select
              value={formData.district || ""}
              onValueChange={(v) => updateField("district", v)}
            >
              <SelectTrigger className="w-full h-12 bg-surface text-sm rounded-xl">
                <SelectValue placeholder="Select your district" />
              </SelectTrigger>
              <SelectContent>
                {DISTRICTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Category
            </label>
            <Select
              value={formData.category || ""}
              onValueChange={(v) => updateField("category", v)}
            >
              <SelectTrigger className="w-full h-12 bg-surface text-sm rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.section>

      {/* Hobbies & Interests */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <h2 className="text-lg font-semibold">Hobbies & Interests</h2>
        </div>

        {/* Hobbies */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Hobbies
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.hobbies?.map((hobby) => (
              <span
                key={hobby}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm"
              >
                {hobby}
                <button
                  onClick={() => removeHobby(hobby)}
                  className="hover:text-pink-900 dark:hover:text-pink-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHobby(newHobby)}
              className="flex-1 px-4 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              placeholder="Add a hobby"
            />
            <button
              onClick={() => addHobby(newHobby)}
              className="px-3 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {HOBBY_SUGGESTIONS.filter(
              (h) => !formData.hobbies?.includes(h)
            ).map((hobby) => (
              <button
                key={hobby}
                onClick={() => addHobby(hobby)}
                className="px-3 py-1.5 bg-surface border border-border rounded-full text-sm text-text-secondary hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-300 dark:hover:border-pink-700 hover:text-pink-700 dark:hover:text-pink-300 transition-all"
              >
                + {hobby}
              </button>
            ))}
          </div>
        </div>

        {/* Extracurriculars */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Extracurricular Activities
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.extracurriculars?.map((activity) => (
              <span
                key={activity}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
              >
                {activity}
                <button
                  onClick={() => removeExtracurricular(activity)}
                  className="hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newExtracurricular}
              onChange={(e) => setNewExtracurricular(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && addExtracurricular(newExtracurricular)
              }
              className="flex-1 px-4 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              placeholder="Add an activity"
            />
            <button
              onClick={() => addExtracurricular(newExtracurricular)}
              className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXTRACURRICULAR_SUGGESTIONS.filter(
              (e) => !formData.extracurriculars?.includes(e)
            ).map((activity) => (
              <button
                key={activity}
                onClick={() => addExtracurricular(activity)}
                className="px-3 py-1.5 bg-surface border border-border rounded-full text-sm text-text-secondary hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all"
              >
                + {activity}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Preferences */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold">Recommendation Preferences</h2>
        </div>

        <p className="text-sm text-text-secondary mb-6">
          Adjust how important each factor is for your career and college
          recommendations (1 = Not Important, 5 = Very Important)
        </p>

        <div className="space-y-6">
          {[
            {
              key: "importance_locality",
              label: "Location Preference",
              description: "Prefer colleges near your area",
            },
            {
              key: "importance_financial",
              label: "Financial Fit",
              description: "Match recommendations to your budget",
            },
            {
              key: "importance_eligibility",
              label: "Eligibility Match",
              description: "Focus on courses matching your qualifications",
            },
            {
              key: "importance_events_hobbies",
              label: "Events & Hobbies",
              description: "Prioritize colleges with activities you enjoy",
            },
            {
              key: "importance_quality",
              label: "Quality & Reputation",
              description: "Focus on highly-rated institutions",
            },
          ].map((pref) => (
            <div key={pref.key}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-medium">{pref.label}</p>
                  <p className="text-sm text-text-secondary">
                    {pref.description}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formData[pref.key as keyof StudentProfileUpdate] || 3}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={
                  (formData[
                    pref.key as keyof StudentProfileUpdate
                  ] as number) || 3
                }
                onChange={(e) =>
                  updateField(
                    pref.key as keyof StudentProfileUpdate,
                    parseInt(e.target.value)
                  )
                }
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>Not Important</span>
                <span>Very Important</span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
