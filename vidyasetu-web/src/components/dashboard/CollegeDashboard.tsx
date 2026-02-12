import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  GraduationCap,
  User,
  Globe,
  MapPin,
  Plus,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Link2,
  BookOpen,
  Settings,
  Library,
  Home,
  UtensilsCrossed,
  Trophy,
  Dumbbell,
  HeartPulse,
  Wifi,
  Monitor,
  Theater,
  ParkingCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface CollegeProfile {
  college_name: string;
  aishe_code: string;
  contact_name: string;
  designation: string;
  contact_email: string;
  contact_phone: string;
  is_verified: boolean;
  is_profile_complete: boolean;
}

interface CollegeData {
  Name: string;
  District: string;
  State: string;
  Website: string;
  Location: string;
  "Year Of Establishment": number;
}

interface ProfileResponse {
  profile: CollegeProfile;
  college_data: CollegeData | null;
  courses: string[];
  is_linked: boolean;
}

type TabType = "profile" | "courses" | "facilities";

export function CollegeDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  // College linking modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [collegeSearchResults, setCollegeSearchResults] = useState<
    { name: string; aishe_code: string; district: string }[]
  >([]);
  const [searchingColleges, setSearchingColleges] = useState(false);

  // Form state
  const [contactForm, setContactForm] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    designation: "",
  });

  // Facilities state
  const [facilities, setFacilities] = useState({
    has_library: false,
    has_hostel: false,
    has_cafeteria: false,
    has_sports_ground: false,
    has_gym: false,
    has_medical_facility: false,
    has_wifi: false,
    has_computer_lab: false,
    has_auditorium: false,
    has_parking: false,
    annual_fees_general: "",
    annual_fees_ews: "",
    hostel_fees: "",
  });
  const [savingFacilities, setSavingFacilities] = useState(false);
  const [facilitiesMessage, setFacilitiesMessage] = useState<string | null>(
    null
  );

  // Get token from auth store
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/college-admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfileData(data);
      setContactForm({
        contact_name: data.profile.contact_name || "",
        contact_email: data.profile.contact_email || "",
        contact_phone: data.profile.contact_phone || "",
        designation: data.profile.designation || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/college-admin/available-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllCourses(data.courses);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/college-admin/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      await fetchProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCourse = async (courseName: string) => {
    try {
      const res = await fetch(`${API_URL}/college-admin/courses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course_name: courseName }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Failed to add course");
        return;
      }
      await fetchProfile();
      setSearchQuery("");
      setShowCourseDropdown(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveCourse = async (courseName: string) => {
    try {
      const res = await fetch(
        `${API_URL}/college-admin/courses/${encodeURIComponent(courseName)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to remove course");
      await fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchColleges = async (query: string) => {
    setCollegeSearchQuery(query);
    if (query.length < 2) {
      setCollegeSearchResults([]);
      return;
    }
    setSearchingColleges(true);
    try {
      const res = await fetch(
        `${API_URL}/college-admin/search-colleges?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setCollegeSearchResults(data.colleges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingColleges(false);
    }
  };

  const handleLinkCollege = async (collegeName: string) => {
    try {
      const res = await fetch(`${API_URL}/college-admin/link-college`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ college_name: collegeName }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Failed to link college");
        return;
      }
      await fetchProfile();
      setShowLinkModal(false);
      setCollegeSearchQuery("");
      setCollegeSearchResults([]);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: Building2 },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "facilities", label: "Facilities", icon: Settings },
  ];

  const filteredCourses = allCourses.filter(
    (c) =>
      c.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !profileData?.courses.includes(c)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchProfile}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">College Dashboard</h1>
        <p className="text-text-secondary">
          Manage your college profile and course offerings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "courses") fetchAvailableCourses();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-surface"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* College Info Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                College Information
              </h3>
              {profileData?.is_linked ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-500 mb-4">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Linked to CollegeList</span>
                  </div>
                  <p className="font-semibold text-lg">
                    {profileData.college_data?.Name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <MapPin className="w-4 h-4" />
                    {profileData.college_data?.District},{" "}
                    {profileData.college_data?.State}
                  </div>
                  {profileData.college_data?.Website && (
                    <a
                      href={profileData.college_data.Website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      {profileData.college_data.Website}
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Link2 className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
                  <p className="text-text-secondary mb-4">
                    No college linked yet. Search and link your college.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowLinkModal(true)}
                  >
                    Link College
                  </Button>
                </div>
              )}
            </div>

            {/* Contact Info Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-text-secondary">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={contactForm.contact_name}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        contact_name: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-4 py-2 border border-border rounded-lg bg-surface text-text"
                    placeholder="e.g., Dr. Sharma"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={contactForm.designation}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        designation: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-4 py-2 border border-border rounded-lg bg-surface text-text"
                    placeholder="e.g., Principal"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Email</label>
                  <input
                    type="email"
                    value={contactForm.contact_email}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        contact_email: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-4 py-2 border border-border rounded-lg bg-surface text-text"
                    placeholder="admin@college.edu"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Phone</label>
                  <input
                    type="tel"
                    value={contactForm.contact_phone}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        contact_phone: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-4 py-2 border border-border rounded-lg bg-surface text-text"
                    placeholder="+91 9876543210"
                  />
                </div>
                <Button
                  onClick={handleUpdateProfile}
                  loading={saving}
                  className="w-full"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Add Course */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add Course
              </h3>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-text-secondary absolute left-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowCourseDropdown(true);
                    }}
                    onFocus={() => setShowCourseDropdown(true)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-text"
                    placeholder="Search courses..."
                  />
                </div>
                {showCourseDropdown && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.slice(0, 10).map((course) => (
                        <button
                          key={course}
                          onClick={() => handleAddCourse(course)}
                          className="w-full text-left px-4 py-2 hover:bg-surface transition-colors flex items-center gap-2"
                        >
                          <GraduationCap className="w-4 h-4 text-primary" />
                          {course}
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-text-secondary text-sm">
                        No matching courses found
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Current Courses */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Courses Offered ({profileData?.courses.length || 0})
              </h3>
              {profileData?.courses.length === 0 ? (
                <p className="text-text-secondary text-center py-8">
                  No courses added yet. Add courses above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData?.courses.map((course) => (
                    <motion.div
                      key={course}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg"
                    >
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span className="text-sm">{course}</span>
                      <button
                        onClick={() => handleRemoveCourse(course)}
                        className="ml-1 text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Facilities Tab */}
        {activeTab === "facilities" && (
          <motion.div
            key="facilities"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                College Facilities
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                Update your college's facilities. Changes are saved
                automatically.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: "has_library", label: "Library", Icon: Library },
                  { key: "has_hostel", label: "Hostel", Icon: Home },
                  {
                    key: "has_cafeteria",
                    label: "Cafeteria",
                    Icon: UtensilsCrossed,
                  },
                  {
                    key: "has_sports_ground",
                    label: "Sports Ground",
                    Icon: Trophy,
                  },
                  { key: "has_gym", label: "Gym", Icon: Dumbbell },
                  {
                    key: "has_medical_facility",
                    label: "Medical",
                    Icon: HeartPulse,
                  },
                  { key: "has_wifi", label: "WiFi", Icon: Wifi },
                  {
                    key: "has_computer_lab",
                    label: "Computer Lab",
                    Icon: Monitor,
                  },
                  { key: "has_auditorium", label: "Auditorium", Icon: Theater },
                  { key: "has_parking", label: "Parking", Icon: ParkingCircle },
                ].map((facility) => (
                  <div
                    key={facility.key}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-surface transition-colors"
                  >
                    <facility.Icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">
                      {facility.label}
                    </span>
                    <input
                      type="checkbox"
                      className="ml-auto w-5 h-5 accent-primary"
                      checked={
                        facilities[
                          facility.key as keyof typeof facilities
                        ] as boolean
                      }
                      onChange={(e) =>
                        setFacilities({
                          ...facilities,
                          [facility.key]: e.target.checked,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Fee Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-text-secondary">
                    Annual Fees (General)
                  </label>
                  <input
                    type="number"
                    placeholder="₹ 50000"
                    value={facilities.annual_fees_general}
                    onChange={(e) =>
                      setFacilities({
                        ...facilities,
                        annual_fees_general: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-4 py-2 border border-border rounded-lg bg-surface text-text"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary">
                    Annual Fees (EWS)
                  </label>
                  <input
                    type="number"
                    placeholder="₹ 10000"
                    value={facilities.annual_fees_ews}
                    onChange={(e) =>
                      setFacilities({
                        ...facilities,
                        annual_fees_ews: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-4 py-2 border border-border rounded-lg bg-surface text-text"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary">
                    Hostel Fees
                  </label>
                  <input
                    type="number"
                    placeholder="₹ 30000"
                    value={facilities.hostel_fees}
                    onChange={(e) =>
                      setFacilities({
                        ...facilities,
                        hostel_fees: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-4 py-2 border border-border rounded-lg bg-surface text-text"
                  />
                </div>
              </div>
              {facilitiesMessage && (
                <p
                  className={`mt-2 text-sm ${facilitiesMessage.includes("Error") ? "text-red-500" : "text-green-500"}`}
                >
                  {facilitiesMessage}
                </p>
              )}
              <Button
                className="mt-4"
                disabled={savingFacilities}
                onClick={async () => {
                  setSavingFacilities(true);
                  setFacilitiesMessage(null);
                  try {
                    const res = await fetch(
                      `${API_URL}/college-admin/facilities`,
                      {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          ...facilities,
                          annual_fees_general: facilities.annual_fees_general
                            ? parseFloat(facilities.annual_fees_general)
                            : null,
                          annual_fees_ews: facilities.annual_fees_ews
                            ? parseFloat(facilities.annual_fees_ews)
                            : null,
                          hostel_fees: facilities.hostel_fees
                            ? parseFloat(facilities.hostel_fees)
                            : null,
                        }),
                      }
                    );
                    if (res.ok) {
                      setFacilitiesMessage("Facilities saved successfully!");
                    } else {
                      const err = await res.json();
                      setFacilitiesMessage(
                        `Error: ${err.detail || "Failed to save"}`
                      );
                    }
                  } catch (err) {
                    setFacilitiesMessage("Error: Could not connect to server");
                  } finally {
                    setSavingFacilities(false);
                  }
                }}
              >
                {savingFacilities ? "Saving..." : "Save Facilities"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* College Linking Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Link Your College</h3>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setCollegeSearchQuery("");
                  setCollegeSearchResults([]);
                }}
                className="text-text-secondary hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="w-5 h-5 text-text-secondary absolute left-3 top-3" />
              <input
                type="text"
                value={collegeSearchQuery}
                onChange={(e) => handleSearchColleges(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-text"
                placeholder="Search by college name..."
              />
            </div>

            {searchingColleges && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}

            {collegeSearchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {collegeSearchResults.map((college) => (
                  <button
                    key={college.name}
                    onClick={() => handleLinkCollege(college.name)}
                    className="w-full text-left p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <p className="font-medium">{college.name}</p>
                    <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                      <MapPin className="w-3 h-3" />
                      {college.district}
                      {college.aishe_code && (
                        <>
                          <span>•</span>
                          <span>AISHE: {college.aishe_code}</span>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {collegeSearchQuery.length >= 2 &&
              !searchingColleges &&
              collegeSearchResults.length === 0 && (
                <p className="text-text-secondary text-sm text-center py-4">
                  No colleges found matching "{collegeSearchQuery}"
                </p>
              )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default CollegeDashboard;
