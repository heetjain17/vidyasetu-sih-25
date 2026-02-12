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
    id: "exam_001",
    exam_name: "JEE Main 2025 Session 1",
    category: "Engineering",
    description:
      "The Joint Entrance Examination (JEE) Main is a national-level entrance exam conducted by the NTA for admission to B.E./B.Tech courses at NITs, IIITs, and other Centrally Funded Technical Institutions (CFTIs).",
    format:
      "Computer Based Test (CBT). Physics, Chemistry, and Mathematics (PCM). Multiple Choice Questions (MCQs) and Numerical Value Questions.",
    website: "https://jeemain.nta.ac.in/",
    events: [
      {
        id: "evt_101",
        title: "Registration Starts",
        date: "2024-11-01T10:00:00Z",
        status: "Past",
        description: "Online application form available for Session 1",
      },
      {
        id: "evt_102",
        title: "Registration Ends",
        date: "2024-12-01T23:59:00Z",
        status: "Past",
        description: "Last date to submit forms and pay fees",
      },
      {
        id: "evt_103",
        title: "Admit Card Release",
        date: "2025-01-20T10:00:00Z",
        status: "Upcoming",
        description:
          "Download admit card from official website using application number",
      },
      {
        id: "evt_104",
        title: "Exam Date",
        date: "2025-01-24T09:00:00Z",
        status: "Upcoming",
        description: "Paper 1 (B.E./B.Tech) to be held in two shifts",
      },
      {
        id: "evt_105",
        title: "Result Declaration",
        date: "2025-02-12T10:00:00Z",
        status: "Upcoming",
        description: "NTA Score and Percentile release",
      },
    ],
  },
  {
    id: "exam_002",
    exam_name: "NEET UG 2025",
    category: "Medical",
    description:
      "The National Eligibility cum Entrance Test (NEET) UG is the single entrance test for admission to MBBS and BDS courses in India.",
    format:
      "Pen and Paper based test (Offline). Physics, Chemistry, and Biology (Botany & Zoology).",
    website: "https://neet.nta.nic.in/",
    events: [
      {
        id: "evt_201",
        title: "Notification Release",
        date: "2025-02-05T10:00:00Z",
        status: "Upcoming",
        description: "Information bulletin release with eligibility criteria",
      },
      {
        id: "evt_202",
        title: "Exam Date",
        date: "2025-05-04T14:00:00Z",
        status: "Upcoming",
        description: "Single shift offline examination",
      },
    ],
  },
];
