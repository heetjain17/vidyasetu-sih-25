import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../constants/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

export default function Index() {
  const theme = useTheme();
  const s = styles(theme);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for auth store to be hydrated from AsyncStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });

    // If already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Redirect based on auth status
    if (isAuthenticated) {
      router.replace("/(app)/home");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isReady, isAuthenticated]);

  return (
    <View style={s.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={s.title}>Loading...</Text>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
    },
    title: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
  });
