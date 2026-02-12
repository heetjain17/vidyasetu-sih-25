import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useProfileStore } from "../../../store/profile";
import { useTheme } from "../../../constants/theme";
import { router } from "expo-router";
import ProgressBar from "../../../components/ProgressBar";
import Spacer from "@/components/Spacer";
import Slider from "@react-native-community/slider";
import { ArrowLeft } from "lucide-react-native";

const PREFERENCE_LABELS = {
  importanceLocality: "How important is college location to you?",
  importanceFinancial: "How important is affordability?",
  importanceEligibility:
    "How important is seat availability for your category?",
  importanceEventsHobbies: "How important are cultural events & activities?",
  importanceQuality: "How important is placement & infrastructure quality?",
};

type PreferenceKey = keyof typeof PREFERENCE_LABELS;

export default function ProfileStep3() {
  const theme = useTheme();
  const s = styles(theme);
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const markProfileComplete = useProfileStore((s) => s.markProfileComplete);

  const handleFinish = () => {
    markProfileComplete();
    router.replace("/(test)/aptitude");
  };

  const preferenceKeys = Object.keys(PREFERENCE_LABELS) as PreferenceKey[];

  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.container}>
          <Text style={s.title}>What matters to you?</Text>
          <Text style={s.progress}>Step 3 of 3</Text>

          <ProgressBar progress={1} />

          <Text style={s.subtitle}>
            Rate each factor from 1 (not important) to 5 (very important)
          </Text>

          <Spacer size={20} />

          {preferenceKeys.map((key) => (
            <View key={key} style={s.sliderContainer}>
              <View style={s.sliderHeader}>
                <Text style={s.sliderLabel}>{PREFERENCE_LABELS[key]}</Text>
                <Text style={s.sliderValue}>{profile[key]}/5</Text>
              </View>
              <Slider
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={profile[key]}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
                onValueChange={(v) => updateProfile({ [key]: v })}
                style={s.slider}
              />
              <View style={s.scaleLabels}>
                <Text style={s.scaleText}>Not important</Text>
                <Text style={s.scaleText}>Very important</Text>
              </View>
            </View>
          ))}

          <Spacer size={30} />

          <View style={s.buttonRow}>
            <TouchableOpacity
              style={s.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={18} color={theme.colors.text} />
              <Text style={s.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.button} onPress={handleFinish}>
              <Text style={s.buttonText}>Start Assessment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 80,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 8,
    },
    progress: {
      fontSize: 14,
      marginBottom: 12,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
    sliderContainer: {
      marginBottom: 24,
    },
    sliderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    sliderLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
      marginRight: 12,
    },
    sliderValue: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    slider: {
      width: "100%",
      height: 40,
    },
    scaleLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: -4,
    },
    scaleText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
    },
    backButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 10,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "600",
    },
    button: {
      flex: 2,
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "700",
    },
  });
