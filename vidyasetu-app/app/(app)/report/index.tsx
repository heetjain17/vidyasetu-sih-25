import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../constants/theme";
import { ArrowLeft, GraduationCap, Briefcase } from "lucide-react-native";
import { router } from "expo-router";
import { useAptitudeStore } from "@/store/aptitude";
import { useProfileStore } from "@/store/profile";
import { useCollegeStore } from "@/store/college";
import { careerToCourse } from "@/services/logic/riasec.recommend";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Report() {
  const theme = useTheme();
  const s = styles(theme);
  const { t } = useTranslation("common");

  const recommendations = useAptitudeStore((s) => s.recommendations);
  const finalParams = useAptitudeStore((s) => s.finalParams);
  const answers = useAptitudeStore((s) => s.answers);
  const collegeRecommendations = useCollegeStore(
    (s) => s.collegeRecommendations
  );

  const [careerCourses, setCareerCourses] = useState<
    { career: string; courses: string[] }[]
  >([]);

  useEffect(() => {
    if (finalParams) {
      const mappings = careerToCourse(finalParams);
      setCareerCourses(mappings);
    }
  }, [finalParams]);

  if (answers.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          backgroundColor: theme.colors.background,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 420,
            backgroundColor: theme.colors.card,
            padding: 24,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.text + "20",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: theme.colors.text,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {t("report.aptitudeTestNeeded")}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 24,
            }}
          >
            {t(
              "report.aptitudeTestDescription",
              "You need to complete the aptitude test to unlock your personalised insights and full career report."
            )}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(test)/aptitude/quiz")}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 14,
              paddingHorizontal: 28,
              borderRadius: 12,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 17,
                fontWeight: "700",
              }}
            >
              {t("report.takeTest")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const username = useProfileStore(
    (s) => s.profile.fullName || t("common.welcome", "Student")
  );
  const top3 = recommendations.slice(0, 3);
  const topColleges = collegeRecommendations.slice(0, 3);
  const top3CareerCourses = careerCourses.slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={s.title}>{t("report.title")}</Text>

        {/* Spacer to center title */}
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContainer}
      >
        {/* INTRO CARD */}
        <View style={s.introCard}>
          <Text style={s.introText}>
            {t("common.hello")} {username}!{" "}
            {t(
              "report.introMessage",
              "Based on your aptitude test and preferences, we've found the best career paths and government colleges for you."
            )}
          </Text>
        </View>

        {/* TOP CAREER RECOMMENDATIONS */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t("report.topCareers")}</Text>
          {top3.length === 0 ? (
            <Text style={s.listItemText}>{t("report.noResults")}</Text>
          ) : (
            top3.map((rec, idx) => (
              <View key={rec.title} style={s.listItem}>
                <Briefcase
                  size={20}
                  color={theme.colors.primary}
                  style={s.icon}
                />
                <Text style={s.listItemText}>
                  {idx + 1}. {rec.title} ({(rec.score * 100).toFixed(1)}%)
                </Text>
              </View>
            ))
          )}
        </View>

        {/* RECOMMENDED COURSES */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t("report.recommendedCourses")}</Text>
          <Text style={s.sectionSubtitle}>{t("report.basedOnCareers")}</Text>
          {top3CareerCourses.length === 0 ? (
            <Text style={s.listItemText}>{t("report.noResults")}</Text>
          ) : (
            top3CareerCourses.map((mapping, idx) => (
              <View key={mapping.career} style={s.courseCard}>
                <Text style={s.courseCareerTitle}>{mapping.career}</Text>
                {mapping.courses.slice(0, 3).map((course, courseIdx) => (
                  <View key={courseIdx} style={s.courseItem}>
                    <GraduationCap
                      size={18}
                      color={theme.colors.text}
                      style={s.courseIcon}
                    />
                    <Text style={s.courseText}>{course}</Text>
                  </View>
                ))}
                {mapping.courses.length > 3 && (
                  <Text style={s.moreText}>
                    {t("report.moreCourses", {
                      count: mapping.courses.length - 3,
                    })}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* TOP COLLEGES RECOMMENDED */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t("report.topColleges")}</Text>
          {topColleges.length === 0 ? (
            <Text style={s.listItemText}>{t("report.noResults")}</Text>
          ) : (
            topColleges.map((rec, idx) => (
              <View key={rec.name} style={s.listItem}>
                <Text style={s.listRank}>{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.collegeName}>{rec.name}</Text>
                  <Text style={s.collegeScore}>
                    {t("report.matchScore")}:{" "}
                    {(rec.finalScore * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* BOTTOM BUTTON */}
        <TouchableOpacity
          style={s.button}
          onPress={() => router.push("/(app)/report/reasoning")}
        >
          <Text style={s.buttonText}>{t("report.seeReasoning")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    header: {
      marginTop: 40,
      paddingHorizontal: 20,
      paddingBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    introCard: {
      backgroundColor: theme.colors.background,
      padding: 16,
      marginTop: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.text,
    },
    introText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 22,
    },
    section: {
      marginTop: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 15,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 12,
      marginTop: -10,
    },
    listItem: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 10,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.text + "15",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    listItemText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500",
      flex: 1,
    },
    listRank: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.primary,
      marginRight: 12,
      width: 24,
    },
    icon: {
      marginRight: 10,
    },
    courseCard: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.text + "15",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    courseCareerTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 12,
    },
    courseItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      paddingLeft: 8,
    },
    courseIcon: {
      marginRight: 8,
    },
    courseText: {
      fontSize: 15,
      color: theme.colors.text,
      flex: 1,
    },
    moreText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontStyle: "italic",
      marginTop: 4,
      paddingLeft: 34,
    },
    collegeName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    collegeScore: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 20,
    },
    buttonText: {
      color: theme.colors.text,
      fontWeight: "700",
      fontSize: 16,
    },
  });
