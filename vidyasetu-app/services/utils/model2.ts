export type Student = {
  Extra_curriculars?: string[];
  Hobbies?: string[];
  Student_Locality?: string;
  [key: string]: any;
};

export type College = {
  Locality?: string;
  Hostel?: string | boolean | number;
  [key: string]: any;
};

export type WillVector = Record<string, number>;

// ------------------------ Config ------------------------
const TOKEN_CLEAN_RE = /[^\w\s]/g;
export const DIM = 12;

// ------------------------ Vocabulary ------------------------
const VOCAB: Record<string, number[]> = {
  // cultural/arts (0–2)
  music: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  singing: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  dance: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  painting: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  theatre: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

  // sports (3–5)
  cricket: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  football: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  basketball: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  running: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],

  // technical (6–8)
  coding: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  programming: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  robotics: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  ai: [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],

  // volunteering (9)
  volunteer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  charity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  volunteering: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],

  // creativity / leadership / misc (10–11)
  photography: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  debating: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  socialwork: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
};

// ------------------------ Helpers ------------------------
function normalizeToken(tok: string): string {
  if (!tok) return "";
  return tok
    .trim()
    .toLowerCase()
    .replace(TOKEN_CLEAN_RE, "")
    .replace(/[-_]/g, "");
}

function zeroVec(): number[] {
  return Array(DIM).fill(0);
}

function addVec(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + (b[i] || 0));
}

function vecNorm(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
}

function normalizeVec(v: number[]): number[] {
  const n = vecNorm(v);
  return v.map((x) => x / n);
}

// ------------------------ Manual embedder ------------------------
export function manualEmbedFromTokens(tokens: string[]): number[] {
  let acc = zeroVec();
  let seen = 0;

  for (const raw of tokens) {
    const t = normalizeToken(raw);
    if (!t) continue;

    let vec = VOCAB[t];

    // substring fallback matching
    if (!vec) {
      for (const key in VOCAB) {
        if (key.includes(t) || t.includes(key)) {
          vec = VOCAB[key];
          break;
        }
      }
    }

    if (!vec) continue;

    acc = addVec(acc, vec);
    seen++;
  }

  if (seen === 0) return normalizeVec(Array(DIM).fill(0.01));

  return normalizeVec(acc);
}

export function manualEmbedFromText(text: string): number[] {
  const clean = (text || "").replace(TOKEN_CLEAN_RE, " ");
  const toks = clean.split(/\s+/).filter(Boolean);
  return manualEmbedFromTokens(toks);
}

export const embed = manualEmbedFromText;

//  Similarity
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const ai = a[i] || 0;
    const bi = b[i] || 0;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// Text Helpers
export function studentEventsText(student: Student): string {
  const extras = (student.Extra_curriculars || []).join(", ");
  const hobbies = (student.Hobbies || []).join(", ");
  return `The student participates in ${extras}. Their hobbies include ${hobbies}.`;
}

export function studentLocalityText(student: Student): string {
  return `The student lives in ${student.Student_Locality || ""}.`;
}

export function collegeLocalityText(college: College): string {
  const loc = college.Locality || "";
  const hostelStr = String(college.Hostel || "No").toLowerCase();
  const hasHostel = ["yes", "true", "1", "y"].includes(hostelStr);
  return `The college is located in ${loc}. ${
    hasHostel ? "Hostel is available." : "Hostel is not available."
  }`;
}

// Will Vector
export function normalizeStudentWillVector(w: WillVector): WillVector {
  const vals = Object.values(w).map((v) => Number(v) || 0);
  const total = vals.reduce((s, v) => s + v, 0);

  if (total === 0) {
    const eq = 1 / vals.length;
    const out: WillVector = {};
    Object.keys(w).forEach((k) => (out[k] = Number(eq.toFixed(4))));
    return out;
  }

  const norm: WillVector = {};
  Object.entries(w).forEach(([k, v]) => {
    norm[k] = Number(((Number(v) || 0) / total).toFixed(4));
  });
  return norm;
}

export function collegeToVector(list: number[]): number[] {
  return list.map((v) => Number(v) || 0);
}

export function studentWillToVector(norm: WillVector): number[] {
  return [
    Number(norm["Importance_Locality"]) || 0,
    Number(norm["Importance_Financial"]) || 0,
    Number(norm["Importance_Eligibility"]) || 0,
    Number(norm["Importance_Events_hobbies"]) || 0,
    Number(norm["Importance_Quality"]) || 0,
  ];
}

// Locality: Coordinates
export const LOCALITY_COORDS: Record<string, [number, number]> = {
  kupwara: [34.432222, 74.123889],
  pulwama: [33.985833, 75.013056],
  ganderbal: [34.216944, 74.771667],
  anantnag: [33.728611, 75.148056],
  kathua: [32.386389, 75.517222],
  budgam: [33.94, 74.638611],
  ramban: [33.246389, 75.193611],
  doda: [33.101667, 75.666111],
  samba: [32.560278, 75.111111],
  rajouri: [33.371667, 74.314722],
  bandipora: [34.509167, 74.686667],
  poonch: [33.766944, 74.884722],
  udhampur: [32.916389, 75.135278],
  reasi: [33.266944, 74.827222],
  kulgam: [33.645, 75.017778],
  shopian: [33.716944, 74.835833],
  baramulla: [34.202148, 74.348259],
  kishtwar: [33.52958, 76.01462],
  unknown: [0.0, 0.0],
};
