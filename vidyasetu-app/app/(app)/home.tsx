import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { useTheme } from "../../constants/theme";
import {
  Menu,
  Bell,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Sparkles,
  User,
} from "lucide-react-native";
import { useState, useEffect } from "react";

import Drawer from "../../components/home/Drawer";
import NotificationPanel from "../../components/home/NotificationPanel";
import { router } from "expo-router";
import { useProfileStore } from "@/store/profile";
import { LanguageIconButton } from "../../components/LanguageIconButton";
import { useTranslation } from "react-i18next";
import { TIMELINE_DATA, updateEventStatuses } from "../../data/timelineData";

export default function Home() {
  const theme = useTheme();
  const s = styles(theme);
  const { t } = useTranslation();
  const username = useProfileStore((s) => s.profile.fullName || "Student");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  // Get upcoming events from timeline data
  const [upcomingEvents, setUpcomingEvents] = useState<
    { exam: string; event: string; date: string; daysLeft: number }[]
  >([]);

  useEffect(() => {
    const exams = updateEventStatuses(TIMELINE_DATA);
    const events: {
      exam: string;
      event: string;
      date: string;
      daysLeft: number;
    }[] = [];

    exams.forEach((exam) => {
      exam.events
        .filter((e) => e.status === "Upcoming")
        .slice(0, 1)
        .forEach((event) => {
          const eventDate = new Date(event.date);
          const now = new Date();
          const daysLeft = Math.ceil(
            (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          events.push({
            exam: exam.exam_name,
            event: event.title,
            date: eventDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),
            daysLeft,
          });
        });
    });

    // Sort by days left and take top 4
    events.sort((a, b) => a.daysLeft - b.daysLeft);
    setUpcomingEvents(events.slice(0, 4));
  }, []);

  // Quick action cards
  const quickActions = [
    {
      icon: Briefcase,
      label: t("nav.careerHub", "Career Hub"),
      color: "#3B82F6",
      route: "/(app)/career-hub",
    },
    {
      icon: MessageSquare,
      label: t("nav.sandbox", "AI Chatbot"),
      color: "#10B981",
      route: "/(app)/sandbox",
    },
    {
      icon: Calendar,
      label: t("nav.timeline", "Timeline"),
      color: "#F59E0B",
      route: "/(app)/timeline",
    },
    {
      icon: GraduationCap,
      label: t("nav.report", "Report"),
      color: "#8B5CF6",
      route: "/(app)/report",
    },
    {
      icon: User,
      label: t("nav.profile", "Profile"),
      color: "#EC4899",
      route: "/(app)/profile",
    },
    {
      icon: MessageSquare,
      label: t("nav.feedback", "Feedback"),
      color: "#06B6D4",
      route: "/(app)/feedback",
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {/* DRAWER */}
      {drawerOpen && (
        <Pressable
          style={s.overlay}
          onPress={() => setDrawerOpen(false)}
          pointerEvents="auto"
        />
      )}
      <Drawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* NOTIFICATION PANEL */}
      {/* <NotificationPanel
        visible={showNotif}
        onClose={() => setShowNotif(false)}
      /> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          marginTop: 50,
          paddingHorizontal: 20,
        }}
      >
        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => setDrawerOpen(true)}>
            <Menu size={28} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={s.title}>VidyaSetu</Text>

          <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <LanguageIconButton />
            {/* <TouchableOpacity onPress={() => setShowNotif(!showNotif)}>
              <Bell size={26} color={theme.colors.text} />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* WELCOME */}
        <View style={s.welcomeCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.welcomeText}>
              {t("home.welcome", { name: username })}
            </Text>
            <Text style={s.welcomeSubtext}>
              {t("home.heroSubtitle", "Let's explore your career path today")}
            </Text>
          </View>
          <View style={s.welcomeIcon}>
            <Sparkles size={32} color={theme.colors.primary} />
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={s.sectionTitle}>
          {t("home.quickActions", "Quick Actions")}
        </Text>
        <View style={s.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[s.quickActionCard, { borderColor: action.color + "40" }]}
              onPress={() => router.push(action.route as any)}
            >
              <View
                style={[
                  s.quickActionIcon,
                  { backgroundColor: action.color + "20" },
                ]}
              >
                <action.icon size={24} color={action.color} />
              </View>
              <Text style={s.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* UPCOMING EVENTS */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            {t("home.upcomingEvents", "Upcoming Events")}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(app)/timeline")}>
            <Text style={s.seeAllText}>{t("home.seeAll", "See All")}</Text>
          </TouchableOpacity>
        </View>

        {upcomingEvents.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            {upcomingEvents.map((event, index) => (
              <TouchableOpacity
                key={index}
                style={s.eventCard}
                onPress={() => router.push("/(app)/timeline")}
              >
                <View style={s.eventDateBadge}>
                  <Text style={s.eventDateText}>{event.date}</Text>
                </View>
                <Text style={s.eventTitle} numberOfLines={2}>
                  {event.event}
                </Text>
                <Text style={s.eventExam} numberOfLines={1}>
                  {event.exam}
                </Text>
                <View style={s.eventDaysRow}>
                  <Clock size={14} color={theme.colors.primary} />
                  <Text style={s.eventDaysText}>
                    {event.daysLeft} {t("home.daysLeft", "days left")}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        {/* AI CHATBOT PROMO */}
        <TouchableOpacity
          style={s.promoCard}
          onPress={() => router.push("/(app)/sandbox")}
        >
          <View style={s.promoContent}>
            <MessageSquare size={28} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={s.promoTitle}>
                {t("home.chatPromo.title", "Ask our AI Chatbot")}
              </Text>
              <Text style={s.promoSubtitle}>
                {t(
                  "home.chatPromo.subtitle",
                  "Get personalized career guidance instantly"
                )}
              </Text>
            </View>
            <ChevronRight size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* STATS CARDS */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: "#3B82F620" }]}>
            <TrendingUp size={24} color="#3B82F6" />
            <Text style={[s.statValue, { color: "#3B82F6" }]}>132</Text>
            <Text style={s.statLabel}>
              {t("home.stats.careers", "Careers")}
            </Text>
          </View>
          <View style={[s.statCard, { backgroundColor: "#10B98120" }]}>
            <GraduationCap size={24} color="#10B981" />
            <Text style={[s.statValue, { color: "#10B981" }]}>136</Text>
            <Text style={s.statLabel}>
              {t("home.stats.colleges", "Colleges")}
            </Text>
          </View>
          <View style={[s.statCard, { backgroundColor: "#F59E0B20" }]}>
            <Calendar size={24} color="#F59E0B" />
            <Text style={[s.statValue, { color: "#F59E0B" }]}>
              {upcomingEvents.length}
            </Text>
            <Text style={s.statLabel}>{t("home.stats.events", "Events")}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.text + "4D",
      zIndex: 10,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.text,
    },
    welcomeCard: {
      backgroundColor: theme.colors.container,
      borderRadius: 20,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    welcomeText: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    welcomeSubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    welcomeIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    seeAllText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    quickActionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
    },
    quickActionCard: {
      width: "47%",
      backgroundColor: theme.colors.container,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    quickActionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      textAlign: "center",
    },
    eventCard: {
      backgroundColor: theme.colors.container,
      borderRadius: 16,
      padding: 16,
      width: 160,
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    eventDateBadge: {
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: "flex-start",
      marginBottom: 10,
    },
    eventDateText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    eventTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    eventExam: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 10,
    },
    eventDaysRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    eventDaysText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    emptyEvents: {
      alignItems: "center",
      padding: 40,
      backgroundColor: theme.colors.container,
      borderRadius: 16,
      marginBottom: 20,
    },
    emptyEventsText: {
      marginTop: 10,
      color: theme.colors.textSecondary,
    },
    promoCard: {
      backgroundColor: "#10B981",
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
    },
    promoContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    promoTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
    promoSubtitle: {
      fontSize: 13,
      color: "#ffffffCC",
      marginTop: 2,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      gap: 6,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800",
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
  });
