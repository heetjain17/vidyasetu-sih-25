import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../../constants/theme";

export default function AptitudeIntro() {
  const theme = useTheme();
  const s = styles(theme);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View>
        <Text style={s.heading}>Let’s Discover your strengths!</Text>

        <Text style={s.desc}>
          Our 5-minute quiz combines aptitude and personality to find the best
          career and college for you.
        </Text>
      </View>

      <View>
        <TouchableOpacity
          style={s.startBtn}
          onPress={() => router.push("/(test)/aptitude/quiz")}
        >
          <Text style={s.startText}>Let’s Start</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.exploreText}
          onPress={() => router.push("/(app)/home")}
        >
          <Text style={s.exploreText}>Explore on your own</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 80,

      justifyContent: "space-between",
      marginTop: 80,
    },
    heading: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    desc: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: 40,
      textAlign: "center",
    },
    startBtn: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    startText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },
    exploreText: {
      fontSize: 16,
      color: theme.colors.text,
      textDecorationLine: "underline",
      textAlign: "center",
      marginTop: 20,
    },
  });
