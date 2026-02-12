import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/constants/theme";
import { Trophy, Microscope, Paintbrush, Heart } from "lucide-react-native";

import { useAptitudeStore } from "@/store/aptitude";
import { CareerRecommendation } from "@/types";
import { useProfileStore } from "@/store/profile";
import { useEffect, useState } from "react";

import { runFullRecommendationPipeline } from "@/services/logic/recommendation.pipeline";
import { useCollegeStore } from "@/store/college";
import collegesData from "@/services/assets/colleges.json";
import { Student } from "@/services/utils/model2";

export default function QuizCompleted() {
  const theme = useTheme();
  const s = styles(theme);

  const profile = useProfileStore((s) => s.profile);
  const aptitudeRecommendations = useAptitudeStore(
    (s) => s.recommendations || []
  );
  const collegeRecommendations = useCollegeStore(
    (s) => s.collegeRecommendations || []
  );

  const userName = profile.fullName || "Student";

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      useCollegeStore.getState().setColleges(collegesData);

      const studentObj: Student = {
        Student_Locality: (profile.city || "").toString(),
        Budget: Number(profile.familyIncome || 0),
        Extra_curriculars: (profile.hobbies || "")
          .toString()
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        Hobbies: (profile.hobbies || "")
          .toString()
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        Gender: (profile.gender || "").toString(),
        Students_Category: (profile.category || "").toString(),
      };

      useCollegeStore.getState().setStudentProfile(studentObj);

      if (aptitudeRecommendations.length === 0) {
        await useAptitudeStore.getState().computeResult?.();
      }

      await runFullRecommendationPipeline();

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Generating Recommendations...</Text>
      </View>
    );
  }

  const careerTop3 = aptitudeRecommendations.slice(0, 3);
  const collegeTop3 = collegeRecommendations.slice(0, 3);

  const CareerClusterItem = ({ name, progress }: any) => (
    <View style={s.clusterItem}>
      <View style={s.clusterTextContainer}>
        <Text style={s.clusterName}>{name}</Text>
        <View style={s.progressBarBackground}>
          <View style={[s.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.headerSection}>
        <Text style={s.title}>Quiz Completed!</Text>
        <Trophy size={60} color={theme.colors.primary} style={s.trophyIcon} />
        <Text style={s.congratulations}>Congratulations, {userName}!</Text>
        <Text style={s.summaryText}>Here’s a summary of your results.</Text>
      </View>

      {/* CAREER RESULTS */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Top Career Clusters</Text>
        {careerTop3.map((rec: CareerRecommendation) => (
          <CareerClusterItem
            key={rec.title}
            name={rec.title}
            progress={rec.score}
          />
        ))}
      </View>

      {/* COLLEGE RESULTS */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Top College Matches</Text>
        {collegeTop3.map((rec) => (
          <CareerClusterItem
            key={rec.name}
            name={rec.name}
            progress={rec.finalScore}
          />
        ))}
      </View>

      <TouchableOpacity
        style={s.reportButton}
        onPress={() => router.push("/(app)/report")}
      >
        <Text style={s.reportButtonText}>Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.homeButton}
        onPress={() => router.replace("/(app)/home")}
      >
        <Text style={s.homeButtonText}>Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 40,
      alignItems: "center",
    },
    headerSection: {
      alignItems: "center",
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: "#003D7A",
      marginBottom: 20,
    },
    trophyIcon: {
      marginBottom: 20,
    },
    congratulations: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 8,
    },
    summaryText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      width: "100%",
      maxWidth: 500,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 15,
    },
    clusterItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
      paddingVertical: 5,
    },
    clusterTextContainer: {
      flex: 1,
    },
    clusterName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 5,
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: "#E0E0E0",
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: "#4CAF50",
      borderRadius: 4,
    },
    reportButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      width: "100%",
      maxWidth: 500,
      alignItems: "center",
      marginBottom: 15,
    },
    reportButtonText: {
      color: theme.colors.text,
      fontWeight: "700",
      fontSize: 18,
    },
    homeButton: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      paddingVertical: 16,
      width: "100%",
      maxWidth: 500,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.text,
    },
    homeButtonText: {
      color: theme.colors.text,
      fontWeight: "700",
      fontSize: 18,
    },
  });
