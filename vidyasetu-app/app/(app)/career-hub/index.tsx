import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import {
  Search,
  Palette,
  FlaskConical,
  Briefcase,
  Code,
  Wrench,
  Rocket,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Building2,
  TrendingUp,
  Star,
  Sparkles,
  X,
  ArrowLeft,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/constants/theme";
import { useCareers } from "@/services/data/hooks/useCareers";
import { useColleges } from "@/services/data/hooks/useColleges";
import { useRoadmaps } from "@/services/data/hooks/useRoadmaps";
import { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Skeleton,
  SkeletonCard,
  SkeletonQuickLink,
  SkeletonRoadmapCard,
} from "@/components/Skeleton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Vibrant color palette for careers (light bg, dark border)
const CAREER_COLORS = [
  { bg: "#e0e7ff", border: "#4f46e5", text: "#312e81" }, // Indigo
  { bg: "#fce7f3", border: "#db2777", text: "#831843" }, // Pink
  { bg: "#cffafe", border: "#0891b2", text: "#164e63" }, // Cyan
  { bg: "#d1fae5", border: "#059669", text: "#064e3b" }, // Emerald
  { bg: "#fef3c7", border: "#d97706", text: "#78350f" }, // Amber
  { bg: "#ede9fe", border: "#7c3aed", text: "#4c1d95" }, // Violet
  { bg: "#ffedd5", border: "#ea580c", text: "#7c2d12" }, // Orange
  { bg: "#dbeafe", border: "#2563eb", text: "#1e3a8a" }, // Blue
];

// Icon mapping for roadmaps
const ICONS: Record<string, any> = {
  Palette,
  FlaskConical,
  Briefcase,
  Code,
  Wrench,
  Rocket,
};

export default function CareerHub() {
  const theme = useTheme();
  const s = styles(theme);
  const { careers, loading: careersLoading } = useCareers();
  const { colleges, loading: collegesLoading } = useColleges();
  const { roadmaps, loading: roadmapsLoading } = useRoadmaps();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Filter careers based on search
  const filteredCareers = useMemo(() => {
    if (!searchQuery.trim()) return careers.slice(0, 8);
    const query = searchQuery.toLowerCase();
    return careers
      .filter(
        (career) =>
          career.careerName.toLowerCase().includes(query) ||
          career.description?.toLowerCase().includes(query)
      )
      .slice(0, 12);
  }, [careers, searchQuery]);

  // Quick stats
  const QUICK_STATS = [
    {
      title: "Colleges",
      count: colleges.length,
      icon: Building2,
      route: "/(app)/career-hub/college",
      bg: "#dbeafe",
      border: "#2563eb",
      iconColor: "#2563eb",
    },
    {
      title: "Careers",
      count: careers.length,
      icon: GraduationCap,
      route: "/(app)/career-hub/careers",
      bg: "#ede9fe",
      border: "#7c3aed",
      iconColor: "#7c3aed",
    },
    {
      title: "Roadmaps",
      count: roadmaps.length,
      icon: BookOpen,
      route: "/(app)/career-hub/roadmaps",
      bg: "#d1fae5",
      border: "#059669",
      iconColor: "#059669",
    },
  ];

  const isLoading = careersLoading || collegesLoading || roadmapsLoading;

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={s.headerContent}>
            <Text style={s.headerTitle}>Career Hub</Text>
            <Text style={s.headerSubtitle}>
              Discover your perfect career path
            </Text>
          </View>
          <View style={s.sparkleContainer}>
            <Sparkles size={24} color={theme.colors.primary} />
          </View>
        </View>

        {/* Search Bar */}
        <View style={s.searchWrapper}>
          <View style={[s.searchContainer, isFocused && s.searchFocused]}>
            <Search
              size={20}
              color={
                isFocused ? theme.colors.primary : theme.colors.textSecondary
              }
            />
            <TextInput
              style={s.searchInput}
              placeholder="Search careers, skills, industries..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Stats Cards */}
        <View style={s.statsContainer}>
          {isLoading ? (
            <>
              <View style={s.statCardSkeleton}>
                <Skeleton width={40} height={40} borderRadius={12} />
                <Skeleton width={50} height={24} style={{ marginTop: 8 }} />
                <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
              </View>
              <View style={s.statCardSkeleton}>
                <Skeleton width={40} height={40} borderRadius={12} />
                <Skeleton width={50} height={24} style={{ marginTop: 8 }} />
                <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
              </View>
              <View style={s.statCardSkeleton}>
                <Skeleton width={40} height={40} borderRadius={12} />
                <Skeleton width={50} height={24} style={{ marginTop: 8 }} />
                <Skeleton width={60} height={12} style={{ marginTop: 4 }} />
              </View>
            </>
          ) : (
            QUICK_STATS.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    s.statCard,
                    { backgroundColor: stat.bg, borderColor: stat.border },
                  ]}
                  onPress={() => router.push(stat.route as any)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      s.statIconWrap,
                      { backgroundColor: stat.border + "20" },
                    ]}
                  >
                    <IconComponent size={22} color={stat.iconColor} />
                  </View>
                  <Text style={[s.statCount, { color: stat.border }]}>
                    {stat.count}
                  </Text>
                  <Text style={s.statTitle}>{stat.title}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Featured Roadmaps */}
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <TrendingUp size={18} color={theme.colors.primary} />
            <Text style={s.sectionTitle}>Career Roadmaps</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(app)/career-hub/roadmaps" as any)}
          >
            <Text style={s.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.roadmapsScroll}
        >
          {roadmapsLoading ? (
            <>
              <SkeletonRoadmapCard />
              <SkeletonRoadmapCard />
              <SkeletonRoadmapCard />
              <SkeletonRoadmapCard />
            </>
          ) : (
            roadmaps.map((roadmap) => {
              const IconComponent = ICONS[roadmap.icon] || Palette;
              return (
                <TouchableOpacity
                  key={roadmap.id}
                  style={[s.roadmapCard, { borderColor: roadmap.color }]}
                  onPress={() =>
                    router.push(
                      `/(app)/career-hub/roadmaps/${roadmap.id}` as any
                    )
                  }
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      s.roadmapIcon,
                      { backgroundColor: roadmap.color + "20" },
                    ]}
                  >
                    <IconComponent size={24} color={roadmap.color} />
                  </View>
                  <Text style={s.roadmapTitle}>
                    {roadmap.title.replace(" Roadmap", "")}
                  </Text>
                  <Text style={s.roadmapStats}>
                    {roadmap.courseCount} courses • {roadmap.skillCount} skills
                  </Text>
                  <View
                    style={[s.roadmapBadge, { backgroundColor: roadmap.color }]}
                  >
                    <Text style={s.roadmapBadgeText}>Explore</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Explore Careers */}
        <View style={s.sectionHeader}>
          <View style={s.sectionTitleRow}>
            <Star size={18} color={theme.colors.primary} />
            <Text style={s.sectionTitle}>
              {searchQuery ? `Results for "${searchQuery}"` : "Popular Careers"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(app)/career-hub/careers" as any)}
          >
            <Text style={s.seeAll}>View all →</Text>
          </TouchableOpacity>
        </View>

        {/* Career Cards Grid */}
        {careersLoading ? (
          <View style={s.careersGrid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : filteredCareers.length === 0 ? (
          <View style={s.emptyContainer}>
            <Search size={48} color={theme.colors.textSecondary} />
            <Text style={s.emptyTitle}>No careers found</Text>
            <Text style={s.emptyText}>
              Try searching with different keywords
            </Text>
          </View>
        ) : (
          <View style={s.careersGrid}>
            {filteredCareers.map((career, index) => {
              const colorSet = CAREER_COLORS[index % CAREER_COLORS.length];
              return (
                <TouchableOpacity
                  key={career.id}
                  style={[
                    s.careerCard,
                    {
                      backgroundColor: colorSet.bg,
                      borderColor: colorSet.border,
                    },
                  ]}
                  onPress={() =>
                    router.push(`/(app)/career-hub/career/${career.id}` as any)
                  }
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      s.careerIconWrap,
                      { backgroundColor: colorSet.border + "20" },
                    ]}
                  >
                    <Briefcase size={16} color={colorSet.border} />
                  </View>
                  <Text
                    style={[s.careerTitle, { color: colorSet.text }]}
                    numberOfLines={2}
                  >
                    {career.careerName}
                  </Text>
                  {career.description && (
                    <Text
                      style={[s.careerDesc, { color: colorSet.text + "cc" }]}
                      numberOfLines={2}
                    >
                      {career.description}
                    </Text>
                  )}
                  <View style={s.careerAction}>
                    <ChevronRight size={14} color={colorSet.border} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Bottom CTA */}
        {!careersLoading && filteredCareers.length > 0 && (
          <TouchableOpacity
            style={s.ctaButton}
            onPress={() => router.push("/(app)/career-hub/careers" as any)}
            activeOpacity={0.8}
          >
            <Text style={s.ctaText}>
              Explore All {careers.length} Careers →
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContainer: { paddingBottom: 120 },

    // Header
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      // borderWidth: 1,
      // borderColor: theme.colors.border,
    },
    headerContent: {
      flex: 1,
      marginLeft: 12,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text,
      letterSpacing: -0.5,
      textAlign: "center",
    },
    headerSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
      textAlign: "center",
    },
    sparkleContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
    },

    // Search
    searchWrapper: { paddingHorizontal: 20, marginBottom: 20 },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 2,
      borderColor: theme.colors.border,
      gap: 12,
    },
    searchFocused: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },

    // Stats
    statsContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 12,
      marginBottom: 28,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      borderWidth: 2,
    },
    statCardSkeleton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    statCount: {
      fontSize: 28,
      fontWeight: "800",
    },
    statTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginTop: 2,
    },

    // Section Headers
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    seeAll: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
    },

    // Roadmaps
    roadmapsScroll: { paddingHorizontal: 20, gap: 12, marginBottom: 28 },
    roadmapCard: {
      width: 160,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
    },
    roadmapIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    roadmapTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    roadmapStats: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    roadmapBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    roadmapBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#262626ff",
    },

    // Careers Grid
    careersGrid: {
      paddingHorizontal: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    careerCard: {
      width: (SCREEN_WIDTH - 52) / 2,
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      minHeight: 140,
    },
    careerIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    careerTitle: {
      fontSize: 14,
      fontWeight: "700",
      lineHeight: 18,
      marginBottom: 6,
    },
    careerDesc: {
      fontSize: 11,
      lineHeight: 14,
    },
    careerAction: {
      position: "absolute",
      bottom: 12,
      right: 12,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
    },

    // Empty State
    emptyContainer: {
      paddingVertical: 60,
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginTop: 16,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
    },

    // CTA Button
    ctaButton: {
      marginHorizontal: 20,
      marginTop: 24,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      alignItems: "center",
    },
    ctaText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
  });
