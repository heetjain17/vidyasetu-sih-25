import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, BookOpen, Building2 } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/constants/theme";
import { useCareer } from "@/services/data/hooks/useCareers";
import { useCourseColleges } from "@/services/data/hooks/useCourses";
import { Skeleton } from "@/components/Skeleton";

export default function CareerDetails() {
  const theme = useTheme();
  const s = styles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { career, courses, loading } = useCareer(id);

  if (loading) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Skeleton width={180} height={24} borderRadius={8} />
          <View style={{ width: 40 }} />
        </View>
        <View style={s.scrollContainer}>
          {/* Skeleton info card */}
          <View style={s.infoCard}>
            <Skeleton width="70%" height={28} style={{ marginBottom: 16 }} />
            <View style={s.riasecGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  style={{ width: "31%", padding: 12, marginBottom: 8 }}
                >
                  <Skeleton
                    width="100%"
                    height={12}
                    style={{ marginBottom: 6 }}
                  />
                  <Skeleton width={40} height={24} />
                </View>
              ))}
            </View>
          </View>
          {/* Skeleton courses */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Skeleton width={24} height={24} borderRadius={6} />
              <Skeleton width={140} height={20} style={{ marginLeft: 8 }} />
            </View>
            <View style={{ gap: 12 }}>
              <Skeleton width="100%" height={100} borderRadius={12} />
              <Skeleton width="100%" height={100} borderRadius={12} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (!career) {
    return (
      <View style={s.container}>
        <View style={s.emptyContainer}>
          <Text style={s.emptyText}>Career not found</Text>
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
          {career.careerName}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContainer}
      >
        {/* CAREER INFO CARD */}
        <View style={s.infoCard}>
          <Text style={s.careerName}>{career.careerName}</Text>

          {/* RIASEC Grid */}
          <View style={s.riasecGrid}>
            <RIASECItem label="Realistic" value={career.r} theme={theme} />
            <RIASECItem label="Investigative" value={career.i} theme={theme} />
            <RIASECItem label="Artistic" value={career.a} theme={theme} />
            <RIASECItem label="Social" value={career.s} theme={theme} />
            <RIASECItem label="Enterprising" value={career.e} theme={theme} />
            <RIASECItem label="Conventional" value={career.c} theme={theme} />
          </View>
        </View>

        {/* COURSES SECTION */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <BookOpen size={24} color={theme.colors.text} />
            <Text style={s.sectionTitle}>Available Courses</Text>
          </View>

          {courses.length === 0 ? (
            <Text style={s.emptyText}>
              No courses available for this career
            </Text>
          ) : (
            courses.map((course) => (
              <CourseCard key={course.id} course={course} theme={theme} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// RIASEC Item Component
const RIASECItem = ({
  label,
  value,
  theme,
}: {
  label: string;
  value: number;
  theme: any;
}) => {
  const s = riasecStyles(theme);
  return (
    <View style={s.item}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
};

// Course Card Component
const CourseCard = ({ course, theme }: { course: any; theme: any }) => {
  const { colleges, loading } = useCourseColleges(course.course);
  const s = courseCardStyles(theme);

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() =>
        router.push(
          `/(app)/career-hub/roadmap/${encodeURIComponent(
            course.course
          )}` as any
        )
      }
      activeOpacity={0.7}
    >
      <Text style={s.courseName}>{course.course}</Text>

      {loading ? (
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
          style={{ marginTop: 8 }}
        />
      ) : (
        <>
          <View style={s.collegeCount}>
            <Building2 size={16} color={theme.colors.textSecondary} />
            <Text style={s.collegeText}>
              {colleges.length} {colleges.length === 1 ? "college" : "colleges"}{" "}
              offering this course
            </Text>
          </View>

          {colleges.length > 0 && (
            <View style={s.collegeList}>
              {colleges.slice(0, 3).map((college, idx) => (
                <Text key={idx} style={s.collegeName}>
                  • {college.name}
                </Text>
              ))}
              {colleges.length > 3 && (
                <Text style={s.moreText}>+{colleges.length - 3} more</Text>
              )}
            </View>
          )}
        </>
      )}

      <Text style={s.viewRoadmap}>Tap to view career roadmap →</Text>
    </TouchableOpacity>
  );
};

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
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    infoCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    careerName: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
    },
    riasecGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
  });

const riasecStyles = (theme: any) =>
  StyleSheet.create({
    item: {
      width: "31%",
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    value: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.primary,
    },
  });

const courseCardStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    courseName: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 12,
    },
    collegeCount: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    collegeText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    collegeList: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    collegeName: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 4,
    },
    moreText: {
      fontSize: 14,
      color: theme.colors.primary,
      marginTop: 4,
      fontWeight: "600",
    },
    viewRoadmap: {
      fontSize: 14,
      color: theme.colors.primary,
      marginTop: 12,
      fontWeight: "600",
    },
  });
