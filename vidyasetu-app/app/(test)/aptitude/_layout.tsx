import { Slot, Stack } from "expo-router"; // Import Stack
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../../constants/theme";
import GridBackground from "@/components/background/GridBackground";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AptitudeLayout() {
  const theme = useTheme();
  const s = styles(theme);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* This View now fills the entire unsafe area */}
      <View style={{ flex: 1 }}>
        <GridBackground type="dots" />
        <View style={{ flex: 1, paddingHorizontal: 30 }}>
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    background: {
      flex: 1,
    },
    imagePattern: {
      opacity: 0.5, // subtle grid effect
    },
  });
