import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/constants/theme";
import { useTranslation } from "react-i18next";

import { useExplanationStore } from "@/store/explanation";
import { useCollegeStore } from "@/store/college";
import { translate } from "@/services/utils/translator";

export default function ReportReasoning() {
  const theme = useTheme();
  const s = styles(theme);
  const { t, i18n } = useTranslation("common");

  // Get current language (en, hi, ks, doi)
  const currentLang = i18n.language || "en";

  const careerExplanations = useExplanationStore((s) => s.careerExplanations);
  const collegeExplanations = useExplanationStore((s) => s.collegeExplanations);
  const collegeRecs = useCollegeStore((s) => s.collegeRecommendations);

  // Helper to get translated career explanation
  const getCareerExplanation = (exp: any) => {
    const traitKey = `career_${exp.trait?.toLowerCase()}_1`;
    const translated = translate(traitKey, currentLang);

    if (translated && currentLang !== "en") {
      return translated;
    }
    return exp.explanation;
  };

  // Helper to get translated college explanation
  const getCollegeExplanation = (reasonId: string) => {
    const translated = translate(reasonId, currentLang);
    return translated || reasonId;
  };

  // ---------- COMPONENTS ----------
  const ReasonCard = ({
    title,
    content,
    subtitle,
  }: {
    title: string;
    content: string;
    subtitle?: string;
  }) => (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      {subtitle && <Text style={s.cardSubtitle}>{subtitle}</Text>}
      <Text style={s.cardText}>{content}</Text>
    </View>
  );

  const CollegeCard = ({
    name,
    reasons,
    breakdown,
    matchScore,
  }: {
    name: string;
    reasons: string[];
    breakdown: any;
    matchScore: number;
  }) => (
    <View style={s.card}>
      <Text style={s.cardTitle}>{name}</Text>

      {/* Translated Reasons */}
      <View style={s.reasonsContainer}>
        <Text style={s.reasonsTitle}>{t("reasoning.whyRecommended")}</Text>
        {reasons.map((reason, i) => (
          <View key={i} style={s.reasonItem}>
            <Text style={s.reasonBullet}>•</Text>
            <Text style={s.reasonText}>{reason}</Text>
          </View>
        ))}
      </View>

      {/* Score Breakdown */}
      <View style={s.breakdownContainer}>
        <Text style={s.breakdownTitle}>{t("reasoning.scoreBreakdown")}</Text>
        <View style={s.breakdownRow}>
          <Text style={s.breakdownLabel}>{t("reasoning.locality")}:</Text>
          <Text style={s.breakdownValue}>{breakdown.locality?.toFixed(2)}</Text>
        </View>
        <View style={s.breakdownRow}>
          <Text style={s.breakdownLabel}>{t("reasoning.financial")}:</Text>
          <Text style={s.breakdownValue}>
            {breakdown.financial?.toFixed(2)}
          </Text>
        </View>
        <View style={s.breakdownRow}>
          <Text style={s.breakdownLabel}>{t("reasoning.eligibility")}:</Text>
          <Text style={s.breakdownValue}>
            {breakdown.eligibility?.toFixed(2)}
          </Text>
        </View>
        <View style={s.breakdownRow}>
          <Text style={s.breakdownLabel}>{t("reasoning.cultural")}:</Text>
          <Text style={s.breakdownValue}>{breakdown.cultural?.toFixed(2)}</Text>
        </View>
        <View style={s.breakdownRow}>
          <Text style={s.breakdownLabel}>{t("reasoning.quality")}:</Text>
          <Text style={s.breakdownValue}>{breakdown.quality?.toFixed(2)}</Text>
        </View>
      </View>

      {/* Score bar */}
      <View style={s.scoreContainer}>
        <Text style={s.scoreLabel}>{t("report.matchScore")}:</Text>
        <Text style={s.scoreValue}>{matchScore}%</Text>
        <View style={s.progressBarBg}>
          <View
            style={[
              s.progressBarFill,
              {
                width: `${matchScore}%`,
                backgroundColor: matchScore > 75 ? "#22C55E" : "#FACC15",
              },
            ]}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={s.title}>{t("reasoning.title")}</Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContainer}
      >
        {/* SECTION HEADER - Career */}
        <Text style={s.sectionTitle}>{t("reasoning.careerExplanations")}</Text>

        {/* ----------- CAREER EXPLANATIONS ----------- */}
        {careerExplanations.map((exp, index) => {
          // Get translated trait name
          const traitId = `trait_${exp.trait}_1`;
          const translatedTrait = translate(traitId, currentLang) || exp.trait;

          // Get translated explanation
          const translatedExplanation = getCareerExplanation(exp);

          // Build title
          const careerName = exp.careerName || translatedTrait;
          const title = careerName;

          // Build subtitle with trait info
          const subtitle = `${t("reasoning.yourTopTrait")} ${translatedTrait}`;

          return (
            <ReasonCard
              key={index}
              title={title}
              subtitle={subtitle}
              content={translatedExplanation}
            />
          );
        })}

        {/* SECTION HEADER - College */}
        <Text style={[s.sectionTitle, { marginTop: 30 }]}>
          {t("reasoning.collegeExplanations")}
        </Text>

        {/* ----------- COLLEGE EXPLANATIONS ----------- */}
        {collegeExplanations.length === 0 ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>{t("reasoning.noExplanations")}</Text>
            <Text style={s.cardText}>
              {t(
                "report.aptitudeTestDescription",
                "Complete the aptitude test to get personalized college recommendations."
              )}
            </Text>
          </View>
        ) : (
          collegeExplanations.map((exp, idx) => {
            const matched = collegeRecs.find((c) => c.name === exp.collegeName);

            // Get translated reasons
            const translatedReasons = exp.reason_ids.map((reasonId) =>
              getCollegeExplanation(reasonId)
            );

            return (
              <CollegeCard
                key={idx}
                name={exp.collegeName}
                matchScore={Math.round((matched?.finalScore || 0) * 100)}
                reasons={translatedReasons}
                breakdown={matched?.breakdown || {}}
              />
            );
          })
        )}

        {/* Thank you message */}
        <View style={s.thankYouCard}>
          <Text style={s.thankYouText}>{t("reasoning.thankYou")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    header: {
      marginTop: 40,
      paddingHorizontal: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 10,
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
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginTop: 20,
      marginBottom: 5,
    },
    card: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      marginTop: 15,
      borderWidth: 1,
      borderColor: theme.colors.text + "15",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 6,
    },
    cardSubtitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
      marginBottom: 8,
    },
    cardText: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    reasonsContainer: {
      marginTop: 10,
    },
    reasonsTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 8,
    },
    reasonItem: {
      flexDirection: "row",
      marginBottom: 6,
    },
    reasonBullet: {
      fontSize: 14,
      color: theme.colors.primary,
      marginRight: 8,
    },
    reasonText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 20,
    },
    breakdownContainer: {
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: theme.colors.text + "20",
    },
    breakdownTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 8,
    },
    breakdownRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    breakdownLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    breakdownValue: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.text,
    },
    scoreContainer: {
      marginTop: 15,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    scoreLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
    },
    scoreValue: {
      fontSize: 14,
      fontWeight: "700",
      marginLeft: 5,
      marginRight: 10,
      color: theme.colors.text,
    },
    progressBarBg: {
      flex: 1,
      height: 10,
      backgroundColor: theme.colors.border,
      borderRadius: 5,
      minWidth: 100,
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 5,
    },
    thankYouCard: {
      // backgroundColor: theme.colors.primary + "20",
      borderRadius: 12,
      padding: 20,
      marginTop: 30,
      alignItems: "center",
    },
    thankYouText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      textAlign: "center",
    },
  });
