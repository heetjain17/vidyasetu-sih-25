import { useTheme } from "../constants/theme";
import { Slot } from "expo-router";
// ================== DATABASE COMMENTED OUT - USING CSV/JSON DATA DIRECTLY ==================
// import { useDatabaseInit } from "../hooks/useDatabaseInit";
// import dbDebug from "@/services/database/debug";
// ===========================================================================================
import { ActivityIndicator, View, Text } from "react-native";
import { useEffect, useState } from "react";
import i18n from "../i18n"; // Import to initialize i18n

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  // ================== DATABASE COMMENTED OUT - USING CSV/JSON DATA DIRECTLY ==================
  // const { isInitialized, isLoading, error } = useDatabaseInit();
  // ===========================================================================================
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  // 🌐 i18n Initialization
  useEffect(() => {
    const checkI18n = () => {
      if (i18n.isInitialized) {
        setIsI18nInitialized(true);
      } else {
        i18n.on("initialized", () => {
          setIsI18nInitialized(true);
        });
      }
    };
    checkI18n();
  }, []);

  // ================== DATABASE SEEDING COMMENTED OUT - USING CSV/JSON DATA DIRECTLY ==================
  // // 🌱 Database Seeding & Debug
  // useEffect(() => {
  //   if (isInitialized) {
  //     console.log("📊 Checking database...");

  //     // ========== DATABASE SEEDING - COMMENT OUT AFTER FIRST RUN ==========
  //     const { seedDatabase } = require("@/services/database/seed-all");
  //     seedDatabase().then(() => {
  //       console.log("📊 Getting stats...");
  //       dbDebug.getStats();
  //     });
  //     // =====================================================================
  //   }
  // }, [isInitialized]);
  // ===================================================================================================

  // Show loading screen while i18n initializes
  if (!isI18nInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
          Loading language...
        </Text>
      </View>
    );
  }

  // Show loading screen while database initializes
  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //       <Text style={{ marginTop: 16 }}>Initializing database...</Text>
  //     </View>
  //   );
  // }

  // Show error if database initialization failed
  // if (error) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
  //       <Text style={{ color: 'red', fontSize: 18, marginBottom: 8 }}>Database Error</Text>
  //       <Text style={{ textAlign: 'center' }}>{error.message}</Text>
  //     </View>
  //   );
  // }

  return <Slot />;
}
