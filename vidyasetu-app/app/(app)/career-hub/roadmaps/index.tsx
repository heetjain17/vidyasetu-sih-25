import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useTheme } from "@/constants/theme";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Palette,
  FlaskConical,
  Briefcase,
  Code,
  Wrench,
  Rocket,
  ArrowLeft,
  BookOpen,
} from "lucide-react-native";
import { useRoadmaps } from "@/services/data/hooks/useRoadmaps";
import { Skeleton } from "@/components/Skeleton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Icon mapping
const ICONS: Record<string, any> = {
  Palette,
  FlaskConical,
  Briefcase,
  Code,
  Wrench,
  Rocket,
};

// Skeleton card for loading
const SkeletonRoadmapCard = ({ theme }: { theme: any }) => (
  <View
    style={{
      width: (SCREEN_WIDTH - 48) / 2,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 18,
      borderWidth: 2,
      borderColor: theme.colors.border,
    }}
  >
    <Skeleton
      width={52}
      height={52}
      borderRadius={14}
      style={{ marginBottom: 14 }}
    />
    <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
    <Skeleton width="100%" height={12} style={{ marginBottom: 6 }} />
    <Skeleton width="80%" height={12} style={{ marginBottom: 16 }} />
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Skeleton width={40} height={30} borderRadius={8} />
      <Skeleton width={40} height={30} borderRadius={8} />
      <Skeleton width={40} height={30} borderRadius={8} />
    </View>
  </View>
);

export default function Roadmaps() {
  const theme = useTheme();
  const s = styles(theme);
  const { roadmaps, loading } = useRoadmaps();

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Career Roadmaps</Text>
          <Text style={s.headerSubtitle}>
            {loading ? "Loading..." : `${roadmaps.length} roadmaps available`}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={s.container}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={s.heroSection}>
          <View style={s.heroIcon}>
            <BookOpen size={28} color={theme.colors.primary} />
          </View>
          <Text style={s.heroTitle}>Learn Step by Step</Text>
          <Text style={s.heroSubtitle}>
            Detailed learning paths with skills, courses, and career
            opportunities
          </Text>
        </View>

        {loading ? (
          <View style={s.grid}>
            <SkeletonRoadmapCard theme={theme} />
            <SkeletonRoadmapCard theme={theme} />
            <SkeletonRoadmapCard theme={theme} />
            <SkeletonRoadmapCard theme={theme} />
          </View>
        ) : (
          <View style={s.grid}>
            {roadmaps.map((roadmap) => {
              const IconComponent = ICONS[roadmap.icon] || Palette;
              return (
                <TouchableOpacity
                  key={roadmap.id}
                  style={[s.card, { borderColor: roadmap.color }]}
                  onPress={() =>
                    router.push(
                      `/(app)/career-hub/roadmaps/${roadmap.id}` as any
                    )
                  }
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      s.iconContainer,
                      { backgroundColor: roadmap.color + "20" },
                    ]}
                  >
                    <IconComponent
                      size={28}
                      color={roadmap.color}
                      strokeWidth={2}
                    />
                  </View>
                  <Text style={s.cardTitle}>
                    {roadmap.title.replace(" Roadmap", "")}
                  </Text>
                  <Text style={s.cardDescription} numberOfLines={2}>
                    {roadmap.description}
                  </Text>
                  <View style={s.statsRow}>
                    <View style={s.stat}>
                      <Text style={[s.statValue, { color: roadmap.color }]}>
                        {roadmap.skillCount}
                      </Text>
                      <Text style={s.statLabel}>Skills</Text>
                    </View>
                    {roadmap.examCount > 0 && (
                      <View style={s.stat}>
                        <Text style={[s.statValue, { color: roadmap.color }]}>
                          {roadmap.examCount}
                        </Text>
                        <Text style={s.statLabel}>Exams</Text>
                      </View>
                    )}
                    <View style={s.stat}>
                      <Text style={[s.statValue, { color: roadmap.color }]}>
                        {roadmap.courseCount}
                      </Text>
                      <Text style={s.statLabel}>Courses</Text>
                    </View>
                  </View>
                  <View
                    style={[s.exploreBadge, { backgroundColor: roadmap.color }]}
                  >
                    <Text style={s.exploreBadgeText}>Start Learning →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { flex: 1 },
    contentContainer: { paddingBottom: 120 },

    // Header
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },

    // Hero
    heroSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    heroIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginTop: 12,
    },
    heroSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },

    // Grid
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      paddingHorizontal: 16,
    },
    card: {
      width: (SCREEN_WIDTH - 48) / 2,
      borderRadius: 20,
      padding: 18,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      minHeight: 220,
    },
    iconContainer: {
      width: 52,
      height: 52,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 14,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 6,
    },
    cardDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
      marginBottom: 14,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 14,
    },
    stat: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 18,
      fontWeight: "700",
    },
    statLabel: {
      fontSize: 10,
      color: theme.colors.textSecondary,
    },
    exploreBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    exploreBadgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#262626ff",
    },
  });
