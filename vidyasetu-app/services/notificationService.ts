import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { TimelineEvent, ExamTimeline } from "../data/timelineData";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permissions not granted");
    return false;
  }

  // Android requires a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("exam-reminders", {
      name: "Exam Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return true;
}

// Schedule notification for an exam event (1 day before)
export async function scheduleExamReminder(
  exam: ExamTimeline,
  event: TimelineEvent
): Promise<string | null> {
  try {
    const eventDate = new Date(event.date);
    const reminderDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
    const now = new Date();

    // Don't schedule if reminder date is in the past
    if (reminderDate <= now) {
      console.log(`Skipping past reminder for ${event.title}`);
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📅 ${exam.exam_name}`,
        body: `Tomorrow: ${event.title}`,
        subtitle: event.description,
        data: {
          examId: exam.id,
          eventId: event.id,
          screen: "timeline",
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });

    console.log(
      `Scheduled notification ${notificationId} for ${event.title} at ${reminderDate}`
    );
    return notificationId;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return null;
  }
}

// Schedule immediate notification when subscribing
export async function scheduleSubscriptionNotification(
  exam: ExamTimeline,
  upcomingEventsCount: number
): Promise<string | null> {
  try {
    // Ensure notification channel exists on Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("exam-reminders", {
        name: "Exam Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
      });
      console.log("[Notification] Android channel created/updated");
    }

    console.log(
      "[Notification] Scheduling immediate notification for:",
      exam.exam_name
    );

    // Build appropriate message based on event count
    let bodyText: string;
    if (upcomingEventsCount === 0) {
      bodyText = "We'll notify you when new events are announced.";
    } else if (upcomingEventsCount === 1) {
      bodyText = "You'll receive a reminder 1 day before the upcoming event.";
    } else {
      bodyText = `You'll receive reminders for ${upcomingEventsCount} upcoming events.`;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `✅ Following ${exam.exam_name}`,
        body: bodyText,
        data: {
          examId: exam.id,
          screen: "timeline",
        },
        sound: true,
      },
      trigger: null, // Show immediately
    });

    console.log(
      "[Notification] Immediate notification scheduled with ID:",
      notificationId
    );
    return notificationId;
  } catch (error) {
    console.error(
      "[Notification] Failed to schedule subscription notification:",
      error
    );
    return null;
  }
}

// Cancel a scheduled notification
export async function cancelNotification(
  notificationId: string
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Cancelled notification ${notificationId}`);
  } catch (error) {
    console.error("Failed to cancel notification:", error);
  }
}

// Cancel all notifications for an exam
export async function cancelAllExamNotifications(
  examId: string
): Promise<void> {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.examId === examId) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }
    }
    console.log(`Cancelled all notifications for exam ${examId}`);
  } catch (error) {
    console.error("Failed to cancel exam notifications:", error);
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
