import { Tabs } from "expo-router";
import { useTheme } from "../../constants/theme";
import {
  Home,
  Briefcase,
  FlaskConical,
  Clock,
  User,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

export default function AppLayout() {
  const theme = useTheme();
  const { t } = useTranslation("navigation");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 66,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: t("tabs.report"),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="career-hub"
        options={{
          title: t("tabs.careerHub"),
          tabBarIcon: ({ color, size }) => (
            <Briefcase color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="sandbox"
        options={{
          title: t("tabs.sandbox"),
          tabBarIcon: ({ color, size }) => (
            <FlaskConical color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="timeline"
        options={{
          title: t("tabs.timeline"),
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="feedback"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
