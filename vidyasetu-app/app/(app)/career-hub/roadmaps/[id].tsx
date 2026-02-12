import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/constants/theme";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Palette,
  FlaskConical,
  Briefcase,
  Code,
  Wrench,
  Rocket,
  GraduationCap,
  BookOpen,
  Award,
  Building2,
  TrendingUp,
} from "lucide-react-native";
import { useRoadmap } from "@/services/data/hooks/useRoadmaps";

// Icon mapping
const ICONS: Record<string, any> = {
  Palette,
  FlaskConical,
  Briefcase,
  Code,
  Wrench,
  Rocket,
};

export default function RoadmapDetail() {
  const theme = useTheme();
  const s = styles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const roadmapId = parseInt(id || "1", 10);
  const { roadmap, courses, loading } = useRoadmap(roadmapId);

  if (loading) {
    return (
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!roadmap) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.errorContainer}>
          <Text style={s.errorText}>Roadmap not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const IconComponent = ICONS[roadmap.icon] || Palette;
  const years = ["year1", "year2", "year3"] as const;

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View
          style={[s.iconContainer, { backgroundColor: roadmap.color + "20" }]}
        >
          <IconComponent size={40} color={roadmap.color} strokeWidth={2} />
        </View>
        <Text style={s.title}>{roadmap.title}</Text>
        <Text style={s.description}>{roadmap.description}</Text>

        {/* Year-by-Year Learning Journey */}
        <Text style={s.sectionTitle}>📚 Learning Journey</Text>
        <View style={s.timelineContainer}>
          {years.map((year, index) => (
            <View key={year} style={s.yearCard}>
              <View style={[s.yearBadge, { backgroundColor: roadmap.color }]}>
                <Text style={s.yearBadgeText}>Year {index + 1}</Text>
              </View>
              <View style={s.skillsContainer}>
                {roadmap.semester[year]?.map((skill, i) => (
                  <View key={i} style={s.skillChip}>
                    <Text style={s.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Internships */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Building2 size={20} color={roadmap.color} />
            <Text style={s.sectionTitleSmall}>Internship Opportunities</Text>
          </View>
          {roadmap.internships.map((item, i) => (
            <View key={i} style={s.listItem}>
              <Text style={s.listBullet}>•</Text>
              <Text style={s.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Competitive Exams */}
        {roadmap.exams.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <BookOpen size={20} color={roadmap.color} />
              <Text style={s.sectionTitleSmall}>Competitive Exams</Text>
            </View>
            {roadmap.exams.map((item, i) => (
              <View key={i} style={s.listItem}>
                <Text style={s.listBullet}>•</Text>
                <Text style={s.listText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Award size={20} color={roadmap.color} />
            <Text style={s.sectionTitleSmall}>Certifications</Text>
          </View>
          <View style={s.chipsContainer}>
            {roadmap.certifications.map((item, i) => (
              <View
                key={i}
                style={[
                  s.chip,
                  {
                    backgroundColor: roadmap.color + "15",
                    borderColor: roadmap.color + "30",
                  },
                ]}
              >
                <Text style={[s.chipText, { color: roadmap.color }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Further Education */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <TrendingUp size={20} color={roadmap.color} />
            <Text style={s.sectionTitleSmall}>Further Education</Text>
          </View>
          <View style={s.chipsContainer}>
            {roadmap.upscaling.map((item, i) => (
              <View
                key={i}
                style={[
                  s.chip,
                  {
                    backgroundColor: roadmap.color + "15",
                    borderColor: roadmap.color + "30",
                  },
                ]}
              >
                <Text style={[s.chipText, { color: roadmap.color }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Relevant Courses */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <GraduationCap size={20} color={roadmap.color} />
            <Text style={s.sectionTitleSmall}>
              Relevant Degrees ({courses.length})
            </Text>
          </View>
          {courses.slice(0, 10).map((item, i) => (
            <View key={i} style={s.listItem}>
              <Text style={s.listBullet}>•</Text>
              <Text style={s.listText}>{item}</Text>
            </View>
          ))}
          {courses.length > 10 && (
            <Text style={s.moreText}>+{courses.length - 10} more courses</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { flex: 1 },
    contentContainer: { padding: 20, paddingBottom: 100 },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    backButton: {
      marginBottom: 16,
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    description: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: 28,
    },
    section: {
      marginBottom: 24,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 12,
    },
    sectionTitleSmall: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
    },
    timelineContainer: { gap: 16, marginTop: 8, marginBottom: 28 },
    yearCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderLeftWidth: 4,
    },
    yearBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 14,
    },
    yearBadgeText: { color: "#262626", fontSize: 13, fontWeight: "700" },
    skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    skillChip: {
      backgroundColor: theme.colors.inputBackground,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    skillText: { fontSize: 13, color: theme.colors.text, fontWeight: "500" },
    listItem: {
      flexDirection: "row",
      marginBottom: 10,
      alignItems: "flex-start",
    },
    listBullet: {
      color: theme.colors.primary,
      marginRight: 10,
      fontSize: 16,
      fontWeight: "bold",
    },
    listText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 22,
    },
    chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    chipText: { fontSize: 13, fontWeight: "600" },
    errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorText: { color: theme.colors.textSecondary, fontSize: 16 },
    moreText: {
      color: theme.colors.primary,
      fontSize: 14,
      marginTop: 12,
      fontWeight: "600",
    },
  });
