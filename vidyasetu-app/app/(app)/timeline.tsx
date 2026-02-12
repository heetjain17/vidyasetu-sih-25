import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "../../constants/theme";
import {
  Calendar,
  Clock,
  CheckCircle,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Bell,
  BellOff,
  ArrowLeft,
  CalendarPlus,
} from "lucide-react-native";
import {
  TIMELINE_DATA,
  updateEventStatuses,
  type ExamTimeline,
  type TimelineEvent,
} from "../../data/timelineData";
import { router } from "expo-router";
import {
  requestNotificationPermissions,
  scheduleSubscriptionNotification,
  scheduleExamReminder,
  cancelAllExamNotifications,
} from "../../services/notificationService";

export default function Timeline() {
  const theme = useTheme();
  const s = styles(theme);

  // Local state for timeline (avoid Zustand hydration issues)
  const [exams, setExams] = useState<ExamTimeline[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [followedExamIds, setFollowedExamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize timeline data
    const updatedExams = updateEventStatuses(TIMELINE_DATA);
    setExams(updatedExams);
    setLoading(false);
  }, []);

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  const getExamStatus = (exam: ExamTimeline) => {
    const hasOngoing = exam.events.some((e) => e.status === "Ongoing");
    if (hasOngoing) return "Ongoing";
    const hasUpcoming = exam.events.some((e) => e.status === "Upcoming");
    if (hasUpcoming) return "Upcoming";
    return "Past";
  };

  const getNextEventDate = (exam: ExamTimeline) => {
    const upcoming = exam.events.find((e) => e.status === "Upcoming");
    if (upcoming) {
      return new Date(upcoming.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
    }
    return "TBD";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "#F59E0B";
      case "Ongoing":
        return "#10B981";
      case "Past":
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const toggleFollow = async (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;

    if (followedExamIds.includes(examId)) {
      // Unfollow - cancel notifications
      setFollowedExamIds(followedExamIds.filter((id) => id !== examId));
      await cancelAllExamNotifications(examId);
      Alert.alert(
        "Unfollowed",
        `You will no longer receive notifications for ${exam.exam_name}`
      );
    } else {
      // Follow - schedule notifications
      setFollowedExamIds([...followedExamIds, examId]);

      // Request permissions first
      const granted = await requestNotificationPermissions();
      console.log("[Notification] Permission granted:", granted);

      if (granted) {
        // Get upcoming events
        const upcomingEvents = exam.events.filter(
          (e) => e.status === "Upcoming"
        );
        console.log(
          "[Notification] Upcoming events count:",
          upcomingEvents.length
        );

        // Send immediate notification confirming subscription
        const notifId = await scheduleSubscriptionNotification(
          exam,
          upcomingEvents.length
        );
        console.log("[Notification] Subscription notification ID:", notifId);

        // Schedule reminders for each upcoming event (1 day before)
        for (const event of upcomingEvents) {
          const reminderId = await scheduleExamReminder(exam, event);
          console.log(
            "[Notification] Reminder scheduled for",
            event.title,
            ":",
            reminderId
          );
        }

        // Show feedback to user with proper messaging
        const eventCount = upcomingEvents.length;
        const eventText =
          eventCount === 1
            ? "1 upcoming event"
            : `${eventCount} upcoming events`;

        const message =
          eventCount > 0
            ? `You're now following ${exam.exam_name}.\n\nYou'll receive reminders 1 day before ${eventText}.`
            : `You're now following ${exam.exam_name}.\n\nWe'll notify you when new events are announced.`;

        Alert.alert("✅ Following!", message, [{ text: "OK" }]);
      } else {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive exam reminders.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const isFollowing = (examId: string) => followedExamIds.includes(examId);

  // Generate Google Calendar URL for an exam
  const generateGoogleCalendarUrl = (exam: ExamTimeline) => {
    // Create events for the first upcoming event
    const upcomingEvent = exam.events.find((e) => e.status === "Upcoming");
    if (!upcomingEvent) {
      Alert.alert(
        "No Upcoming Events",
        "This exam has no upcoming events to add."
      );
      return;
    }

    const eventDate = new Date(upcomingEvent.date);
    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatDate = (d: Date) => {
      return d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    };

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${exam.exam_name}: ${upcomingEvent.title}`,
      dates: `${formatDate(eventDate)}/${formatDate(endDate)}`,
      details: `${upcomingEvent.description}\n\nExam: ${exam.exam_name}\nWebsite: ${exam.website}`,
      location: exam.website,
    });

    const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
    Linking.openURL(url);
  };

  // Add all events to Google Calendar
  const addAllToCalendar = (exam: ExamTimeline) => {
    const upcomingEvents = exam.events.filter((e) => e.status === "Upcoming");
    if (upcomingEvents.length === 0) {
      Alert.alert(
        "No Upcoming Events",
        "This exam has no upcoming events to add."
      );
      return;
    }

    Alert.alert(
      "Add to Google Calendar",
      `Add ${upcomingEvents.length} upcoming event(s) for ${exam.exam_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add First Event",
          onPress: () => generateGoogleCalendarUrl(exam),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={s.loadingText}>Loading timeline...</Text>
      </View>
    );
  }

  // Detail view if exam is selected
  if (selectedExam) {
    return (
      <View style={s.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.detailHeader}>
            <TouchableOpacity
              onPress={() => setSelectedExamId(null)}
              style={s.backButton}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={s.detailTitle} numberOfLines={1}>
              {selectedExam.exam_name}
            </Text>
            <TouchableOpacity
              onPress={() => toggleFollow(selectedExam.id)}
              style={[
                s.followButton,
                isFollowing(selectedExam.id) && s.followButtonActive,
              ]}
            >
              {isFollowing(selectedExam.id) ? (
                <Bell size={20} color={theme.colors.primary} />
              ) : (
                <BellOff size={20} color={theme.colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Status Badge */}
          <View style={s.statusRow}>
            <View
              style={[
                s.statusBadge,
                {
                  backgroundColor:
                    getStatusColor(getExamStatus(selectedExam)) + "20",
                },
              ]}
            >
              <Clock
                size={14}
                color={getStatusColor(getExamStatus(selectedExam))}
              />
              <Text
                style={[
                  s.statusText,
                  { color: getStatusColor(getExamStatus(selectedExam)) },
                ]}
              >
                {getExamStatus(selectedExam)}
              </Text>
            </View>
            <View style={s.categoryBadge}>
              <Text style={s.categoryText}>{selectedExam.category}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={s.description}>{selectedExam.description}</Text>

          {/* Format & Website */}
          <View style={s.infoCards}>
            {selectedExam.format && (
              <View style={s.infoCard}>
                <Text style={s.infoLabel}>Format</Text>
                <Text style={s.infoValue}>{selectedExam.format}</Text>
              </View>
            )}
            {selectedExam.website && (
              <TouchableOpacity
                style={s.infoCard}
                onPress={() => Linking.openURL(selectedExam.website)}
              >
                <Text style={s.infoLabel}>Official Website</Text>
                <View style={s.linkRow}>
                  <Text style={s.linkText}>Visit Site</Text>
                  <ExternalLink size={14} color={theme.colors.primary} />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Google Calendar Button */}
          <TouchableOpacity
            style={s.calendarButton}
            onPress={() => addAllToCalendar(selectedExam)}
          >
            <CalendarPlus size={22} color="#fff" />
            <Text style={s.calendarButtonText}>Sync to Google Calendar</Text>
          </TouchableOpacity>

          {/* Timeline Events */}
          <Text style={s.sectionTitle}>Exam Schedule</Text>
          <View style={s.timeline}>
            {selectedExam.events.map((event, index) => (
              <EventItem
                key={event.id}
                event={event}
                isLast={index === selectedExam.events.length - 1}
                theme={theme}
              />
            ))}
          </View>

          {/* Follow CTA */}
          {!isFollowing(selectedExam.id) && (
            <TouchableOpacity
              style={s.followCTA}
              onPress={() => toggleFollow(selectedExam.id)}
            >
              <Bell size={20} color="#fff" />
              <Text style={s.followCTAText}>
                Get Notified (1 day before events)
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  // List view
  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.listHeader}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={s.mainTitle}>Exam Timeline</Text>
            <Text style={s.subtitle}>Track important dates & deadlines</Text>
          </View>
        </View>

        {/* Following Section */}
        {followedExamIds.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Following</Text>
            {exams
              .filter((e) => followedExamIds.includes(e.id))
              .map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  isFollowing={true}
                  onPress={() => setSelectedExamId(exam.id)}
                  onFollow={() => toggleFollow(exam.id)}
                  onCalendar={() => addAllToCalendar(exam)}
                  getStatus={getExamStatus}
                  getNextDate={getNextEventDate}
                  getStatusColor={getStatusColor}
                  theme={theme}
                />
              ))}
          </View>
        )}

        {/* All Exams Section */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>All Exams</Text>
          {exams
            .filter((e) => !followedExamIds.includes(e.id))
            .map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                isFollowing={false}
                onPress={() => setSelectedExamId(exam.id)}
                onFollow={() => toggleFollow(exam.id)}
                onCalendar={() => addAllToCalendar(exam)}
                getStatus={getExamStatus}
                getNextDate={getNextEventDate}
                getStatusColor={getStatusColor}
                theme={theme}
              />
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Exam Card Component
const ExamCard = ({
  exam,
  isFollowing,
  onPress,
  onFollow,
  onCalendar,
  getStatus,
  getNextDate,
  getStatusColor,
  theme,
}: {
  exam: ExamTimeline;
  isFollowing: boolean;
  onPress: () => void;
  onFollow: () => void;
  onCalendar: () => void;
  getStatus: (e: ExamTimeline) => string;
  getNextDate: (e: ExamTimeline) => string;
  getStatusColor: (s: string) => string;
  theme: ReturnType<typeof useTheme>;
}) => {
  const status = getStatus(exam);
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: theme.colors.container,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isFollowing
            ? theme.colors.primary + "50"
            : theme.colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.inputBackground,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.textSecondary,
              fontWeight: "600",
            }}
          >
            {exam.category}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* Google Calendar Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onCalendar();
            }}
            style={{
              padding: 6,
              borderRadius: 20,
              backgroundColor: "#4285F420",
            }}
          >
            <CalendarPlus size={18} color="#4285F4" />
          </TouchableOpacity>
          {/* Follow Button */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onFollow();
            }}
            style={{
              padding: 6,
              borderRadius: 20,
              backgroundColor: isFollowing
                ? theme.colors.primary + "20"
                : "transparent",
            }}
          >
            <Bookmark
              size={18}
              color={
                isFollowing ? theme.colors.primary : theme.colors.textSecondary
              }
              fill={isFollowing ? theme.colors.primary : "none"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={{
          fontSize: 17,
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: 8,
        }}
      >
        {exam.exam_name}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Calendar size={14} color={theme.colors.textSecondary} />
          <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
            {getNextDate(exam)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Clock size={14} color={getStatusColor(status)} />
          <Text
            style={{
              fontSize: 13,
              color: getStatusColor(status),
              fontWeight: "500",
            }}
          >
            {status}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <ChevronRight size={18} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

// Event Item Component
const EventItem = ({
  event,
  isLast,
  theme,
}: {
  event: TimelineEvent;
  isLast: boolean;
  theme: ReturnType<typeof useTheme>;
}) => {
  const getEventColor = () => {
    switch (event.status) {
      case "Past":
        return "#10B981";
      case "Ongoing":
        return "#F59E0B";
      case "Upcoming":
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <View style={{ flexDirection: "row", marginBottom: isLast ? 0 : 24 }}>
      {/* Timeline indicator */}
      <View style={{ alignItems: "center", width: 32 }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: getEventColor(),
            backgroundColor: theme.colors.container,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {event.status === "Past" ? (
            <CheckCircle size={14} color={getEventColor()} />
          ) : (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: getEventColor(),
              }}
            />
          )}
        </View>
        {!isLast && (
          <View
            style={{
              width: 2,
              flex: 1,
              backgroundColor: theme.colors.border,
              marginTop: 4,
            }}
          />
        )}
      </View>

      {/* Event content */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{ fontSize: 16, fontWeight: "600", color: theme.colors.text }}
        >
          {event.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
            {new Date(event.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <View
            style={{
              backgroundColor: getEventColor() + "20",
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: getEventColor(),
                fontWeight: "500",
              }}
            >
              {event.status}
            </Text>
          </View>
        </View>
        {event.description && (
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.textSecondary,
              marginTop: 4,
            }}
          >
            {event.description}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingTop: 50,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    listHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
    },
    backButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.container,
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    section: {
      marginBottom: 24,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    detailHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    detailTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    followButton: {
      padding: 10,
      borderRadius: 12,
      backgroundColor: theme.colors.container,
    },
    followButtonActive: {
      backgroundColor: theme.colors.primary + "20",
    },
    statusRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "600",
    },
    categoryBadge: {
      backgroundColor: theme.colors.container,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    categoryText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    description: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: 20,
    },
    infoCards: {
      gap: 12,
      marginBottom: 16,
    },
    infoCard: {
      backgroundColor: theme.colors.container,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    infoLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    infoValue: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    linkText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    calendarButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: "#4285F4",
      padding: 16,
      borderRadius: 14,
      marginBottom: 24,
    },
    calendarButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 20,
    },
    timeline: {
      marginBottom: 24,
    },
    followCTA: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 14,
      marginBottom: 40,
    },
    followCTAText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
  });
