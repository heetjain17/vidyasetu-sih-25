const fs = require("fs");

// Helper function to parse CSV line with quoted fields
function parseCSVLine(line) {
  const parts = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts;
}

// 1. Create riasec_score_to_career_weights.json from RIASEC_rows.csv
const riasecCsv = fs.readFileSync("data/RIASEC_rows.csv", "utf-8");
const riasecLines = riasecCsv.trim().split("\n").slice(1);

const careers = riasecLines.map((line) => {
  const parts = parseCSVLine(line);
  return {
    Title: parts[0],
    Realistic: parseFloat(parts[1]) || 0,
    Investigative: parseFloat(parts[2]) || 0,
    Artistic: parseFloat(parts[3]) || 0,
    Social: parseFloat(parts[4]) || 0,
    Enterprising: parseFloat(parts[5]) || 0,
    Conventional: parseFloat(parts[6]) || 0,
  };
});

fs.writeFileSync(
  "services/assets/riasec_score_to_career_weights.json",
  JSON.stringify(careers, null, 2)
);
console.log(
  "Created riasec_score_to_career_weights.json with",
  careers.length,
  "careers"
);

// 2. Create Career_to_course.json from career_to_course_rows.csv
const careerCourseCsv = fs.readFileSync(
  "data/career_to_course_rows.csv",
  "utf-8"
);
const careerCourseLines = careerCourseCsv.trim().split("\n").slice(1);

const careerToCourseMap = {};
careerCourseLines.forEach((line) => {
  const parts = parseCSVLine(line);
  const career = parts[1];
  const course = parts[2];

  if (!career || !course) return;

  if (!careerToCourseMap[career]) careerToCourseMap[career] = [];
  if (!careerToCourseMap[career].includes(course))
    careerToCourseMap[career].push(course);
});

fs.writeFileSync(
  "services/assets/Career_to_course.json",
  JSON.stringify(careerToCourseMap, null, 2)
);
console.log(
  "Created Career_to_course.json with",
  Object.keys(careerToCourseMap).length,
  "careers"
);

// 3. Create Course_to_college.json from course_to_college_rows.csv
const courseCollegeCsv = fs.readFileSync(
  "data/course_to_college_rows.csv",
  "utf-8"
);
const courseCollegeLines = courseCollegeCsv.trim().split("\n").slice(1);

const courseToCollegeMap = {};
courseCollegeLines.forEach((line) => {
  const parts = parseCSVLine(line);
  const course = parts[1];
  const college = parts[2];

  if (!course || !college) return;

  if (!courseToCollegeMap[course]) courseToCollegeMap[course] = [];
  if (!courseToCollegeMap[course].includes(college))
    courseToCollegeMap[course].push(college);
});

fs.writeFileSync(
  "services/assets/Course_to_college.json",
  JSON.stringify(courseToCollegeMap, null, 2)
);
console.log(
  "Created Course_to_college.json with",
  Object.keys(courseToCollegeMap).length,
  "courses"
);

// 4. Create colleges.json from CollegeList_rows.csv
const collegesCsv = fs.readFileSync("data/CollegeList_rows.csv", "utf-8");
const collegesLines = collegesCsv.trim().split("\n").slice(1);

const colleges = collegesLines.map((line, idx) => {
  const parts = parseCSVLine(line);
  // Use capitalized property names to match what the recommender expects
  return {
    id: idx + 1,
    aishe_code: parts[0] || null,
    Name: parts[1] || "", // Recommender uses college.Name
    name: parts[1] || "", // Also keep lowercase for Career Hub UI
    district: parts[2] || null,
    Locality: parts[2] || null, // Recommender uses college.Locality (maps to district)
    state: parts[3] || null,
    website: parts[4] || null,
    year_of_establishment: parts[5] ? parseInt(parts[5]) : null,
    location: parts[6] || null,
    college_type: parts[7] || null,
    management: parts[8] || null,
    university_name: parts[9] || null,
    for_girls: parts[11] === "TRUE" || parts[11] === "1" ? 1 : 0,
    // Default values for recommender scoring (not in CSV, use defaults)
    Hostel: "No",
    Fees: 50000, // Default fee estimate
    Scholarships: "No",
    Fests_Flags: { cultural: "No", sport: "No", technical: "No", others: "No" },
    Reservation: [],
    Gender_Policy:
      parts[11] === "TRUE" || parts[11] === "1" ? "female_only" : "coed",
    Infrastructure: 5,
    Facilities: {
      Library: "Yes",
      Sports_Facility: "No",
      Medical_Facility: "No",
      Canteen: "No",
      Computer_Lab_Nos: 1,
      Science_Lab_Nos: 1,
    },
  };
});

fs.writeFileSync(
  "services/assets/colleges.json",
  JSON.stringify(colleges, null, 2)
);
console.log("Created colleges.json with", colleges.length, "colleges");

// 5. Create courses.json from Courses_rows.csv
const coursesCsv = fs.readFileSync("data/Courses_rows.csv", "utf-8");
const coursesLines = coursesCsv.trim().split("\n").slice(1);

const coursesData = coursesLines.map((line, idx) => {
  const parts = parseCSVLine(line);
  return {
    id: idx + 1,
    name: parts[1] || "",
    roadmap_id: parts[2] ? parseInt(parts[2]) : null,
    stream: parts[3] || null,
  };
});

fs.writeFileSync(
  "services/assets/courses.json",
  JSON.stringify(coursesData, null, 2)
);
console.log("Created courses.json with", coursesData.length, "courses");

// 6. Create roadmaps.json from roadmap_templates_rows.csv
const roadmapsCsv = fs.readFileSync("data/roadmap_templates_rows.csv", "utf-8");
const roadmapsLines = roadmapsCsv.trim().split("\n").slice(1);

const roadmaps = roadmapsLines.map((line) => {
  const parts = parseCSVLine(line);

  let semester = {},
    internships = [],
    exams = [],
    certifications = [],
    upscaling = [];

  try {
    semester = JSON.parse(parts[2] || "{}");
  } catch (e) {}
  try {
    internships = JSON.parse(parts[3] || "[]");
  } catch (e) {}
  try {
    exams = JSON.parse(parts[4] || "[]");
  } catch (e) {}
  try {
    certifications = JSON.parse(parts[5] || "[]");
  } catch (e) {}
  try {
    upscaling = JSON.parse(parts[6] || "[]");
  } catch (e) {}

  return {
    id: parseInt(parts[0]) || 0,
    title: parts[1] || "",
    semester,
    internships,
    exams,
    certifications,
    upscaling,
  };
});

fs.writeFileSync(
  "services/assets/roadmaps.json",
  JSON.stringify(roadmaps, null, 2)
);
console.log("Created roadmaps.json with", roadmaps.length, "roadmaps");

console.log("\n✅ All JSON files created successfully from CSV data!");
