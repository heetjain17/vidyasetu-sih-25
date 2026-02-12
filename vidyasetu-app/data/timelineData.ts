export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  status: "Upcoming" | "Ongoing" | "Past";
  description: string;
}

export interface ExamTimeline {
  id: string;
  exam_name: string;
  category: string;
  description: string;
  format: string;
  website: string;
  events: TimelineEvent[];
}

export const TIMELINE_DATA: ExamTimeline[] = [
  {
    id: "exam_jee_2025",
    exam_name: "JEE Main 2025 Session 1",
    category: "Engineering",
    description:
      "Joint Entrance Examination (JEE) Main for admission to B.E./B.Tech at NITs, IIITs, and CFTIs.",
    format: "Computer Based Test (CBT) - Physics, Chemistry, Mathematics",
    website: "https://jeemain.nta.ac.in/",
    events: [
      {
        id: "jee_reg_start",
        title: "Registration Starts",
        date: "2024-11-01T10:00:00Z",
        status: "Past",
        description: "Online application form available for Session 1",
      },
      {
        id: "jee_reg_end",
        title: "Registration Ends",
        date: "2024-12-01T23:59:00Z",
        status: "Past",
        description: "Last date to submit forms and pay fees",
      },
      {
        id: "jee_admit",
        title: "Admit Card Release",
        date: "2025-01-20T10:00:00Z",
        status: "Upcoming",
        description: "Download admit card using application number",
      },
      {
        id: "jee_exam",
        title: "Exam Date",
        date: "2025-01-24T09:00:00Z",
        status: "Upcoming",
        description: "Paper 1 (B.E./B.Tech) in two shifts",
      },
      {
        id: "jee_result",
        title: "Result Declaration",
        date: "2025-02-12T10:00:00Z",
        status: "Upcoming",
        description: "NTA Score and Percentile release",
      },
    ],
  },
  {
    id: "exam_neet_2025",
    exam_name: "NEET UG 2025",
    category: "Medical",
    description:
      "National Eligibility cum Entrance Test for MBBS and BDS courses across India.",
    format: "Pen and Paper (Offline) - Physics, Chemistry, Biology",
    website: "https://neet.nta.nic.in/",
    events: [
      {
        id: "neet_notify",
        title: "Notification Release",
        date: "2025-02-05T10:00:00Z",
        status: "Upcoming",
        description: "Information bulletin with eligibility criteria",
      },
      {
        id: "neet_reg",
        title: "Registration Opens",
        date: "2025-02-10T10:00:00Z",
        status: "Upcoming",
        description: "Online application form available",
      },
      {
        id: "neet_exam",
        title: "Exam Date",
        date: "2025-05-04T14:00:00Z",
        status: "Upcoming",
        description: "Single shift offline examination",
      },
    ],
  },
  {
    id: "exam_jkcet_2025",
    exam_name: "JKCET 2025",
    category: "Engineering",
    description:
      "Jammu & Kashmir Common Entrance Test for admission to B.E./B.Tech courses in J&K government colleges.",
    format: "Online CBT - Physics, Chemistry, Mathematics",
    website: "https://jkbopee.gov.in/",
    events: [
      {
        id: "jkcet_notify",
        title: "Notification",
        date: "2025-03-01T10:00:00Z",
        status: "Upcoming",
        description: "JKBOPEE releases official notification",
      },
      {
        id: "jkcet_reg",
        title: "Registration Starts",
        date: "2025-03-15T10:00:00Z",
        status: "Upcoming",
        description: "Online application begins",
      },
      {
        id: "jkcet_exam",
        title: "Exam Date",
        date: "2025-05-20T09:00:00Z",
        status: "Upcoming",
        description: "CBT examination at designated centers",
      },
      {
        id: "jkcet_result",
        title: "Result",
        date: "2025-06-10T10:00:00Z",
        status: "Upcoming",
        description: "Merit list announcement",
      },
    ],
  },
  {
    id: "exam_jkbose_12",
    exam_name: "JKBOSE Class 12 Exams 2025",
    category: "Board Exam",
    description:
      "Jammu & Kashmir Board of School Education Class 12 Annual Examinations.",
    format: "Offline written exams",
    website: "https://jkbose.nic.in/",
    events: [
      {
        id: "jkbose_datesheet",
        title: "Datesheet Release",
        date: "2025-02-01T10:00:00Z",
        status: "Upcoming",
        description: "Exam schedule announced",
      },
      {
        id: "jkbose_admit",
        title: "Admit Cards",
        date: "2025-02-20T10:00:00Z",
        status: "Upcoming",
        description: "School-wise admit cards distributed",
      },
      {
        id: "jkbose_exam_start",
        title: "Exams Begin",
        date: "2025-03-01T09:00:00Z",
        status: "Upcoming",
        description: "First paper of board exam",
      },
      {
        id: "jkbose_result",
        title: "Results",
        date: "2025-06-15T10:00:00Z",
        status: "Upcoming",
        description: "Class 12 results declaration",
      },
    ],
  },
  {
    id: "exam_cuet_2025",
    exam_name: "CUET UG 2025",
    category: "University",
    description:
      "Common University Entrance Test for admission to UG programs in Central and participating universities.",
    format: "Computer Based Test (CBT)",
    website: "https://cuet.samarth.ac.in/",
    events: [
      {
        id: "cuet_notify",
        title: "Notification",
        date: "2025-02-15T10:00:00Z",
        status: "Upcoming",
        description: "NTA releases official notification",
      },
      {
        id: "cuet_reg",
        title: "Registration",
        date: "2025-02-25T10:00:00Z",
        status: "Upcoming",
        description: "Online registration begins",
      },
      {
        id: "cuet_exam",
        title: "Exam Window",
        date: "2025-05-15T09:00:00Z",
        status: "Upcoming",
        description: "CBT conducted in multiple phases",
      },
    ],
  },
  {
    id: "exam_clat_2025",
    exam_name: "CLAT 2025",
    category: "Law",
    description:
      "Common Law Admission Test for admission to National Law Universities.",
    format: "Computer Based Test - English, GK, Legal Reasoning, Maths",
    website: "https://consortiumofnlus.ac.in/",
    events: [
      {
        id: "clat_reg",
        title: "Registration Ends",
        date: "2024-12-15T23:59:00Z",
        status: "Past",
        description: "Last date to apply",
      },
      {
        id: "clat_admit",
        title: "Admit Card",
        date: "2024-12-20T10:00:00Z",
        status: "Upcoming",
        description: "Download admit card from portal",
      },
      {
        id: "clat_exam",
        title: "Exam Date",
        date: "2024-12-01T14:00:00Z",
        status: "Past",
        description: "CLAT 2025 examination",
      },
    ],
  },
];

// Helper to update event statuses based on current date
export function updateEventStatuses(exams: ExamTimeline[]): ExamTimeline[] {
  const now = new Date();
  return exams.map((exam) => ({
    ...exam,
    events: exam.events.map((event) => {
      const eventDate = new Date(event.date);
      const daysDiff = Math.floor(
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      let status: "Upcoming" | "Ongoing" | "Past";
      if (daysDiff < -1) {
        status = "Past";
      } else if (daysDiff <= 1) {
        status = "Ongoing";
      } else {
        status = "Upcoming";
      }

      return { ...event, status };
    }),
  }));
}
