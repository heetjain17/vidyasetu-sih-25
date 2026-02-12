import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TIMELINE_DATA,
  updateEventStatuses,
  type ExamTimeline,
} from "../data/timelineData";
import {
  requestNotificationPermissions,
  scheduleExamReminder,
  scheduleSubscriptionNotification,
  cancelAllExamNotifications,
} from "../services/notificationService";

interface TimelineState {
  exams: ExamTimeline[];
  followedExamIds: string[];
  selectedExamId: string | null;
  notificationsEnabled: boolean;

  // Actions
  initializeTimeline: () => void;
  selectExam: (examId: string | null) => void;
  toggleFollowExam: (examId: string) => Promise<void>;
  isFollowing: (examId: string) => boolean;
  getFollowedExams: () => ExamTimeline[];
  enableNotifications: () => Promise<boolean>;
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      exams: [],
      followedExamIds: [],
      selectedExamId: null,
      notificationsEnabled: false,

      initializeTimeline: () => {
        // Load and update timeline data with current statuses
        const updatedExams = updateEventStatuses(TIMELINE_DATA);
        set({ exams: updatedExams });

        // Select first exam by default
        if (updatedExams.length > 0 && !get().selectedExamId) {
          set({ selectedExamId: updatedExams[0].id });
        }
      },

      selectExam: (examId) => {
        set({ selectedExamId: examId });
      },

      toggleFollowExam: async (examId) => {
        const { followedExamIds, exams, notificationsEnabled } = get();
        const isCurrentlyFollowing = followedExamIds.includes(examId);
        const exam = exams.find((e) => e.id === examId);

        if (!exam) return;

        if (isCurrentlyFollowing) {
          // Unfollow - remove from list and cancel notifications
          set({
            followedExamIds: followedExamIds.filter((id) => id !== examId),
          });
          await cancelAllExamNotifications(examId);
        } else {
          // Follow - add to list and schedule notifications
          set({ followedExamIds: [...followedExamIds, examId] });

          // Request permissions if needed
          if (!notificationsEnabled) {
            const granted = await requestNotificationPermissions();
            set({ notificationsEnabled: granted });
          }

          // Schedule notifications for upcoming events
          const upcomingEvents = exam.events.filter(
            (e) => e.status === "Upcoming"
          );

          // Show immediate subscription confirmation
          await scheduleSubscriptionNotification(exam, upcomingEvents.length);

          // Schedule reminders 1 day before each upcoming event
          for (const event of upcomingEvents) {
            await scheduleExamReminder(exam, event);
          }
        }
      },

      isFollowing: (examId) => {
        return get().followedExamIds.includes(examId);
      },

      getFollowedExams: () => {
        const { exams, followedExamIds } = get();
        return exams.filter((e) => followedExamIds.includes(e.id));
      },

      enableNotifications: async () => {
        const granted = await requestNotificationPermissions();
        set({ notificationsEnabled: granted });
        return granted;
      },
    }),
    {
      name: "timeline-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        followedExamIds: state.followedExamIds,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);
