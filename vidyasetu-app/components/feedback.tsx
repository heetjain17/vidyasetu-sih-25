import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../constants/theme";
import {
  MessageSquare,
  Send,
  CheckCircle,
  ArrowLeft,
  User,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/auth";

type RatingType = "Yes" | "Somewhat" | "No";

export default function Feedback() {
  const theme = useTheme();
  const s = styles(theme);
  const { t } = useTranslation("common");
  const accessToken = useAuthStore((s) => s.accessToken);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question1, setQuestion1] = useState<RatingType>("Yes");
  const [question2, setQuestion2] = useState<RatingType>("Yes");
  const [suggestions, setSuggestions] = useState("");

  const ratings: RatingType[] = ["Yes", "Somewhat", "No"];

  const getRatingColor = (rating: RatingType, selected: boolean) => {
    if (!selected) return theme.colors.border;
    switch (rating) {
      case "Yes":
        return "#10B981";
      case "Somewhat":
        return "#F59E0B";
      case "No":
        return "#EF4444";
    }
  };

  const getRatingBg = (rating: RatingType, selected: boolean) => {
    if (!selected) return "transparent";
    switch (rating) {
      case "Yes":
        return "#10B98120";
      case "Somewhat":
        return "#F59E0B20";
      case "No":
        return "#EF444420";
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Submit to backend
      const response = await fetch("http://10.6.0.175:8000/feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          role: "Student",
          recommendations_useful: question1,
          recommendations_accurate: question2,
          suggestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Feedback submission error:", error);
      Alert.alert(t("common.error"), t("feedback.submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={s.container}>
        <View style={s.successContainer}>
          <View style={s.successIcon}>
            <CheckCircle size={48} color="#10B981" />
          </View>
          <Text style={s.successTitle}>{t("feedback.thankYou")}</Text>
          <Text style={s.successSubtitle}>{t("feedback.thankYouDesc")}</Text>
          <TouchableOpacity
            style={s.backHomeButton}
            onPress={() => router.back()}
          >
            <Text style={s.backHomeButtonText}>{t("actions.done")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={s.title}>{t("feedback.title")}</Text>
        </View>

        {/* Role Badge */}
        <View style={s.roleBadgeContainer}>
          <View style={s.roleBadge}>
            <User size={16} color={theme.colors.primary} />
            <Text style={s.roleBadgeText}>
              {t("feedback.feedbackAs", { role: "Student" })}
            </Text>
          </View>
        </View>

        {/* Question 1 */}
        <View style={s.questionCard}>
          <Text style={s.questionText}>{t("feedback.question1")}</Text>
          <View style={s.ratingsRow}>
            {ratings.map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  s.ratingButton,
                  {
                    borderColor: getRatingColor(rating, question1 === rating),
                    backgroundColor: getRatingBg(rating, question1 === rating),
                  },
                ]}
                onPress={() => setQuestion1(rating)}
              >
                <Text
                  style={[
                    s.ratingText,
                    {
                      color:
                        question1 === rating
                          ? getRatingColor(rating, true)
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {rating === "Somewhat"
                    ? t("common.somewhat")
                    : rating === "Yes"
                    ? t("common.yes")
                    : t("common.no")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Question 2 */}
        <View style={s.questionCard}>
          <Text style={s.questionText}>{t("feedback.question2")}</Text>
          <View style={s.ratingsRow}>
            {ratings.map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  s.ratingButton,
                  {
                    borderColor: getRatingColor(rating, question2 === rating),
                    backgroundColor: getRatingBg(rating, question2 === rating),
                  },
                ]}
                onPress={() => setQuestion2(rating)}
              >
                <Text
                  style={[
                    s.ratingText,
                    {
                      color:
                        question2 === rating
                          ? getRatingColor(rating, true)
                          : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {rating === "Somewhat"
                    ? t("common.somewhat")
                    : rating === "Yes"
                    ? t("common.yes")
                    : t("common.no")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Suggestions */}
        <View style={s.questionCard}>
          <Text style={s.questionText}>{t("feedback.suggestions")}</Text>
          <TextInput
            style={s.textArea}
            value={suggestions}
            onChangeText={setSuggestions}
            placeholder={t("feedback.suggestionsPlaceholder")}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={s.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send size={20} color="#fff" />
              <Text style={s.submitButtonText}>
                {t("feedback.submitFeedback")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingTop: 50,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 24,
    },
    backButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.container,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text,
    },
    roleBadgeContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    roleBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + "20",
      borderWidth: 1,
      borderColor: theme.colors.primary + "40",
    },
    roleBadgeText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    questionCard: {
      backgroundColor: theme.colors.container,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    questionText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16,
    },
    ratingsRow: {
      flexDirection: "row",
      gap: 10,
    },
    ratingButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: "center",
    },
    ratingText: {
      fontSize: 14,
      fontWeight: "600",
    },
    textArea: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      fontSize: 14,
      color: theme.colors.text,
      minHeight: 120,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: theme.colors.primary,
      padding: 18,
      borderRadius: 14,
      marginBottom: 40,
    },
    submitButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    successContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 100,
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#10B98120",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 8,
    },
    successSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: 32,
    },
    backHomeButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    backHomeButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });
