import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  TrendingUp,
  Award,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/constants/theme";
import { useRoadmap } from "@/services/data/hooks/useRoadmap";

export default function RoadmapScreen() {
  const theme = useTheme();
  const s = styles(theme);
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const courseName = decodeURIComponent(courseId);
  const { roadmap, loading } = useRoadmap(courseName);

  if (loading) {
    return (
      <View style={s.container}>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={s.loadingText}>Loading roadmap...</Text>
        </View>
      </View>
    );
  }

  if (!roadmap) {
    return (
      <View style={s.container}>
        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={28} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={s.headerTitle} numberOfLines={1}>
            Roadmap
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <View style={s.emptyContainer}>
          <Text style={s.emptyText}>No roadmap available for this course</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={s.headerTitle} numberOfLines={1}>
          Career Roadmap
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContainer}
      >
        {/* COURSE NAME */}
        <View style={s.courseCard}>
          <Text style={s.courseName}>{courseName}</Text>
        </View>

        {/* ROADMAP DETAILS */}
        <View style={s.detailsContainer}>
          {/* Duration */}
          <View style={s.detailCard}>
            <View style={s.iconContainer}>
              <Calendar size={24} color={theme.colors.primary} />
            </View>
            <View style={s.detailContent}>
              <Text style={s.detailLabel}>Course Duration</Text>
              <Text style={s.detailValue}>
                {roadmap.years} {roadmap.years === 1 ? "Year" : "Years"}
              </Text>
            </View>
          </View>

          {/* Internships */}
          <View style={s.detailCard}>
            <View style={s.iconContainer}>
              <Briefcase size={24} color={theme.colors.primary} />
            </View>
            <View style={s.detailContent}>
              <Text style={s.detailLabel}>Internships</Text>
              <Text style={s.detailValue}>
                {roadmap.internships}{" "}
                {roadmap.internships === 1 ? "Opportunity" : "Opportunities"}
              </Text>
            </View>
          </View>

          {/* Placement Rate */}
          <View style={s.detailCard}>
            <View style={s.iconContainer}>
              <TrendingUp size={24} color={theme.colors.primary} />
            </View>
            <View style={s.detailContent}>
              <Text style={s.detailLabel}>Placement Rate</Text>
              <Text style={s.detailValue}>{roadmap.placements}%</Text>
            </View>
          </View>

          {/* Upscaling */}
          {roadmap.upscaling && (
            <View style={[s.detailCard, s.upscalingCard]}>
              <View style={s.iconContainer}>
                <Award size={24} color={theme.colors.primary} />
              </View>
              <View style={s.detailContent}>
                <Text style={s.detailLabel}>Upscaling Opportunities</Text>
                <Text style={s.upscalingText}>{roadmap.upscaling}</Text>
              </View>
            </View>
          )}
        </View>

        {/* TIMELINE */}
        <View style={s.timelineContainer}>
          <Text style={s.timelineTitle}>Career Timeline</Text>

          {Array.from({ length: roadmap.years }).map((_, index) => (
            <View key={index} style={s.timelineItem}>
              <View style={s.timelineDot} />
              <View style={s.timelineContent}>
                <Text style={s.yearText}>Year {index + 1}</Text>
                <Text style={s.yearDescription}>
                  {index === 0 && "Foundation & Core Concepts"}
                  {index === 1 && "Advanced Topics & Specialization"}
                  {index === 2 && "Industry Projects & Internship"}
                  {index === 3 && "Final Project & Placement Preparation"}
                  {index > 3 && `Year ${index + 1} Activities`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      marginTop: 40,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      flex: 1,
      textAlign: "center",
      marginHorizontal: 16,
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    courseCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    courseName: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
    },
    detailsContainer: {
      gap: 12,
      marginBottom: 32,
    },
    detailCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    detailContent: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    upscalingCard: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
    upscalingText: {
      fontSize: 15,
      color: theme.colors.text,
      lineHeight: 22,
      marginTop: 4,
    },
    timelineContainer: {
      marginTop: 8,
    },
    timelineTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 20,
    },
    timelineItem: {
      flexDirection: "row",
      marginBottom: 24,
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
      marginTop: 4,
      marginRight: 16,
    },
    timelineContent: {
      flex: 1,
    },
    yearText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    yearDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });
