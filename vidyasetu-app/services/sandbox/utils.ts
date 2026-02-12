// services/sandbox/utils.ts - Enhanced with course embedder and locality helpers
// Dual-purpose embedder: hobbies/recommender + course search

const _tokenRe = /[^\w\s]/g;

// ==============================================================================
// SHARED CONSTANTS & VECTOR HELPERS
// ==============================================================================
export const DIM = 24;

export const IDX = {
  CULTURE: 0,
  SPORTS: 4,
  TECH: 8,
  SCIENCE: 12,
  FACILITY: 16,
  ADMISSION: 20
};

export type Vector24D = number[];
export type LocalityCoords = [number, number]; // [lat, lon]

function catVec(start: number): number[] {
  const v = Array(DIM).fill(0);
  v[start] = 1;
  return v;
}

function normalizeToken(tok: string): string {
  if (!tok) return "";
  let token = String(tok).trim().toLowerCase();
  token = token.replace(_tokenRe, "");
  token = token.replace(/[-_]/g, "");
  return token;
}

function zeroVec(): number[] {
  return Array(DIM).fill(0.0);
}

function addVec(a: number[], b: number[]): number[] {
  const out = new Array(DIM);
  for (let i = 0; i < DIM; i++) out[i] = (a[i] || 0) + (b[i] || 0);
  return out;
}

function vecNorm(v: number[]): number {
  let s = 0;
  for (let i = 0; i < DIM; i++) s += v[i] * v[i];
  return Math.sqrt(s) || 1.0;
}

function normalizeVec(v: number[]): number[] {
  const n = vecNorm(v);
  return v.map(x => x / n);
}

// ==============================================================================
// ORIGINAL VOCAB (for hobbies/interests/recommender)
// ==============================================================================
const CULTURE: Record<string, number[]> = {
  music: catVec(IDX.CULTURE), singing: catVec(IDX.CULTURE), song: catVec(IDX.CULTURE),
  dance: catVec(IDX.CULTURE), dancing: catVec(IDX.CULTURE), painting: catVec(IDX.CULTURE),
  painter: catVec(IDX.CULTURE), drawing: catVec(IDX.CULTURE), sketch: catVec(IDX.CULTURE),
  sketching: catVec(IDX.CULTURE), art: catVec(IDX.CULTURE), artist: catVec(IDX.CULTURE),
  theatre: catVec(IDX.CULTURE), drama: catVec(IDX.CULTURE), acting: catVec(IDX.CULTURE),
  actor: catVec(IDX.CULTURE), photography: catVec(IDX.CULTURE), photo: catVec(IDX.CULTURE),
  creative: catVec(IDX.CULTURE), creativity: catVec(IDX.CULTURE), writing: catVec(IDX.CULTURE),
  writer: catVec(IDX.CULTURE), poetry: catVec(IDX.CULTURE), poem: catVec(IDX.CULTURE),
  literature: catVec(IDX.CULTURE), debate: catVec(IDX.CULTURE), debating: catVec(IDX.CULTURE),
  speech: catVec(IDX.CULTURE), fashion: catVec(IDX.CULTURE), modeling: catVec(IDX.CULTURE),
  makeup: catVec(IDX.CULTURE), craft: catVec(IDX.CULTURE)
};

const SPORTS: Record<string, number[]> = {
  sports: catVec(IDX.SPORTS), cricket: catVec(IDX.SPORTS), football: catVec(IDX.SPORTS),
  basketball: catVec(IDX.SPORTS), running: catVec(IDX.SPORTS), jogging: catVec(IDX.SPORTS),
  athletics: catVec(IDX.SPORTS), badminton: catVec(IDX.SPORTS), tennis: catVec(IDX.SPORTS),
  tabletennis: catVec(IDX.SPORTS), volleyball: catVec(IDX.SPORTS), swimming: catVec(IDX.SPORTS),
  gym: catVec(IDX.SPORTS), fitness: catVec(IDX.SPORTS), yoga: catVec(IDX.SPORTS),
  kabaddi: catVec(IDX.SPORTS), khokho: catVec(IDX.SPORTS), cycling: catVec(IDX.SPORTS),
  footballer: catVec(IDX.SPORTS), athlete: catVec(IDX.SPORTS), boxing: catVec(IDX.SPORTS),
  wrestling: catVec(IDX.SPORTS), marathon: catVec(IDX.SPORTS), striker: catVec(IDX.SPORTS),
  defender: catVec(IDX.SPORTS), midfielder: catVec(IDX.SPORTS)
};

const TECH: Record<string, number[]> = {
  coding: catVec(IDX.TECH), programmer: catVec(IDX.TECH), programming: catVec(IDX.TECH),
  developer: catVec(IDX.TECH), engineering: catVec(IDX.TECH), engineer: catVec(IDX.TECH),
  btech: catVec(IDX.TECH), mtech: catVec(IDX.TECH), computer: catVec(IDX.TECH),
  cs: catVec(IDX.TECH), it: catVec(IDX.TECH), robotics: catVec(IDX.TECH), robot: catVec(IDX.TECH),
  ai: catVec(IDX.TECH), ml: catVec(IDX.TECH), data: catVec(IDX.TECH), database: catVec(IDX.TECH),
  web: catVec(IDX.TECH), frontend: catVec(IDX.TECH), backend: catVec(IDX.TECH), app: catVec(IDX.TECH),
  android: catVec(IDX.TECH), ios: catVec(IDX.TECH), hacker: catVec(IDX.TECH), hacking: catVec(IDX.TECH),
  cyber: catVec(IDX.TECH), security: catVec(IDX.TECH), electronics: catVec(IDX.TECH),
  electrical: catVec(IDX.TECH), mechanical: catVec(IDX.TECH), civil: catVec(IDX.TECH),
  architecture: catVec(IDX.TECH), architect: catVec(IDX.TECH), software: catVec(IDX.TECH),
  hardware: catVec(IDX.TECH)
};

const SCIENCE: Record<string, number[]> = {
  science: catVec(IDX.SCIENCE), physics: catVec(IDX.SCIENCE), chemistry: catVec(IDX.SCIENCE),
  biology: catVec(IDX.SCIENCE), maths: catVec(IDX.SCIENCE), mathematics: catVec(IDX.SCIENCE),
  botany: catVec(IDX.SCIENCE), zoology: catVec(IDX.SCIENCE), geology: catVec(IDX.SCIENCE),
  microbiology: catVec(IDX.SCIENCE), biochemistry: catVec(IDX.SCIENCE), nursing: catVec(IDX.SCIENCE),
  medical: catVec(IDX.SCIENCE), medicine: catVec(IDX.SCIENCE), pharmacy: catVec(IDX.SCIENCE),
  physiotherapy: catVec(IDX.SCIENCE), dentistry: catVec(IDX.SCIENCE), psychology: catVec(IDX.SCIENCE),
  sociology: catVec(IDX.SCIENCE), economics: catVec(IDX.SCIENCE), business: catVec(IDX.SCIENCE),
  commerce: catVec(IDX.SCIENCE), finance: catVec(IDX.SCIENCE), accounting: catVec(IDX.SCIENCE),
  mba: catVec(IDX.SCIENCE), bba: catVec(IDX.SCIENCE), ba: catVec(IDX.SCIENCE), bsc: catVec(IDX.SCIENCE),
  msc: catVec(IDX.SCIENCE), statistics: catVec(IDX.SCIENCE), english: catVec(IDX.SCIENCE)
};

const FACILITY: Record<string, number[]> = {
  library: catVec(IDX.FACILITY), hostel: catVec(IDX.FACILITY), canteen: catVec(IDX.FACILITY),
  cafeteria: catVec(IDX.FACILITY), transport: catVec(IDX.FACILITY), bus: catVec(IDX.FACILITY),
  lab: catVec(IDX.FACILITY), laboratory: catVec(IDX.FACILITY), computerlab: catVec(IDX.FACILITY),
  playground: catVec(IDX.FACILITY), auditorium: catVec(IDX.FACILITY), sportsfacility: catVec(IDX.FACILITY),
  campus: catVec(IDX.FACILITY), wifi: catVec(IDX.FACILITY), internet: catVec(IDX.FACILITY),
  parking: catVec(IDX.FACILITY), medicalroom: catVec(IDX.FACILITY), clinic: catVec(IDX.FACILITY),
  hospital: catVec(IDX.FACILITY), classroom: catVec(IDX.FACILITY), smartclass: catVec(IDX.FACILITY),
  counsellingroom: catVec(IDX.FACILITY), placementcell: catVec(IDX.FACILITY), hostelroom: catVec(IDX.FACILITY),
  accommodation: catVec(IDX.FACILITY), mess: catVec(IDX.FACILITY), drinkingwater: catVec(IDX.FACILITY),
  hygiene: catVec(IDX.FACILITY), washroom: catVec(IDX.FACILITY), lavatory: catVec(IDX.FACILITY)
};

const ADMISSION: Record<string, number[]> = {
  admission: catVec(IDX.ADMISSION), eligibility: catVec(IDX.ADMISSION), category: catVec(IDX.ADMISSION),
  general: catVec(IDX.ADMISSION), obc: catVec(IDX.ADMISSION), sc: catVec(IDX.ADMISSION), st: catVec(IDX.ADMISSION),
  ews: catVec(IDX.ADMISSION), fee: catVec(IDX.ADMISSION), fees: catVec(IDX.ADMISSION), scholarship: catVec(IDX.ADMISSION),
  stipend: catVec(IDX.ADMISSION), grant: catVec(IDX.ADMISSION), cutoff: catVec(IDX.ADMISSION), cutOff: catVec(IDX.ADMISSION),
  quota: catVec(IDX.ADMISSION), management: catVec(IDX.ADMISSION), reservation: catVec(IDX.ADMISSION), seat: catVec(IDX.ADMISSION),
  seats: catVec(IDX.ADMISSION), intake: catVec(IDX.ADMISSION), exam: catVec(IDX.ADMISSION), entrance: catVec(IDX.ADMISSION),
  rank: catVec(IDX.ADMISSION), marks: catVec(IDX.ADMISSION), merit: catVec(IDX.ADMISSION), counselling: catVec(IDX.ADMISSION),
  board: catVec(IDX.ADMISSION), cbse: catVec(IDX.ADMISSION), jkbose: catVec(IDX.ADMISSION), aiq: catVec(IDX.ADMISSION),
  managementquota: catVec(IDX.ADMISSION), hostelFee: catVec(IDX.ADMISSION), tuition: catVec(IDX.ADMISSION),
  payment: catVec(IDX.ADMISSION), paid: catVec(IDX.ADMISSION), affordable: catVec(IDX.ADMISSION), budget: catVec(IDX.ADMISSION)
};

export const VOCAB = Object.assign({}, CULTURE, SPORTS, TECH, SCIENCE, FACILITY, ADMISSION);

// ==============================================================================
// ORIGINAL MANUAL EMBEDDER (for recommender)
// ==============================================================================
export function manualEmbedFromTokens(tokens: string[]): number[] {
  const acc = zeroVec();
  let seen = 0;
  for (const t0 of tokens) {
    const tok = normalizeToken(t0);
    if (!tok) continue;
    if (/^[0-9]+$/.test(tok)) continue; // skip pure numbers
    let vec = VOCAB[tok];
    if (!vec) {
      for (const key in VOCAB) {
        if (tok.startsWith(key) || key.startsWith(tok)) {
          vec = VOCAB[key];
          break;
        }
      }
    }
    if (!vec) continue;
    const newAcc = addVec(acc, vec);
    for (let i = 0; i < DIM; i++) acc[i] = newAcc[i];
    seen++;
  }
  if (seen === 0) return normalizeVec(Array(DIM).fill(0.01));
  return normalizeVec(acc);
}

export function manualEmbedFromText(text: string): number[] {
  const clean = (text || "").replace(_tokenRe, " ");
  let toks = clean.split(/\s+/).filter(Boolean);
  if (toks.length > 60) toks = toks.slice(0, 60);
  return manualEmbedFromTokens(toks);
}

export const embed = manualEmbedFromText;

// ==============================================================================
// COURSE-FOCUSED VOCAB + EMBEDDER (for college search)
// ==============================================================================
function courseVec(idx: number): number[] {
  const v = Array(DIM).fill(0);
  v[idx] = 1;
  return v;
}

const COURSE_GROUP = {
  ENGINEERING: 0,
  MEDICAL: 6,
  DENTAL: 7,
  AYUSH: 8,
  NURSING: 9,
  PHARMACY: 10,
  LAW: 11,
  MANAGEMENT: 12,
  ARTS: 13,
  SCIENCE: 14,
  COMMERCE: 15,
  EDUCATION: 16,
  AGRI: 17,
  POLYTECHNIC: 18,
  DIPLOMA: 19,
  GEN_DEGREE: 20,
  OTHER: 21
};

export const COURSE_VOCAB: Record<string, number[]> = {
  // Engineering
  "engineering": courseVec(COURSE_GROUP.ENGINEERING),
  "btech": courseVec(COURSE_GROUP.ENGINEERING),
  "b.e": courseVec(COURSE_GROUP.ENGINEERING),
  "be": courseVec(COURSE_GROUP.ENGINEERING),
  "bachelor of engineering": courseVec(COURSE_GROUP.ENGINEERING),
  "cse": courseVec(COURSE_GROUP.ENGINEERING),
  "computer science": courseVec(COURSE_GROUP.ENGINEERING),
  "it": courseVec(COURSE_GROUP.ENGINEERING),
  "mechanical": courseVec(COURSE_GROUP.ENGINEERING),
  "mechanical engineering": courseVec(COURSE_GROUP.ENGINEERING),
  "civil": courseVec(COURSE_GROUP.ENGINEERING),
  "civil engineering": courseVec(COURSE_GROUP.ENGINEERING),
  "ece": courseVec(COURSE_GROUP.ENGINEERING),
  "electronics": courseVec(COURSE_GROUP.ENGINEERING),
  "eee": courseVec(COURSE_GROUP.ENGINEERING),
  "electrical": courseVec(COURSE_GROUP.ENGINEERING),
  "electrical engineering": courseVec(COURSE_GROUP.ENGINEERING),
  
  // Medical
  "mbbs": courseVec(COURSE_GROUP.MEDICAL),
  "medicine": courseVec(COURSE_GROUP.MEDICAL),
  "medical": courseVec(COURSE_GROUP.MEDICAL),
  
  "bds": courseVec(COURSE_GROUP.DENTAL),
  "dentistry": courseVec(COURSE_GROUP.DENTAL),
  "dental": courseVec(COURSE_GROUP.DENTAL),
  
  "bams": courseVec(COURSE_GROUP.AYUSH),
  "bhms": courseVec(COURSE_GROUP.AYUSH),
  "bums": courseVec(COURSE_GROUP.AYUSH),
  "b.u.m.s": courseVec(COURSE_GROUP.AYUSH),
  "unani": courseVec(COURSE_GROUP.AYUSH),
  "ayurveda": courseVec(COURSE_GROUP.AYUSH),
  "homeopathy": courseVec(COURSE_GROUP.AYUSH),
  
  "nursing": courseVec(COURSE_GROUP.NURSING),
  "bsc nursing": courseVec(COURSE_GROUP.NURSING),
  "b.sc nursing": courseVec(COURSE_GROUP.NURSING),
  
  "pharmacy": courseVec(COURSE_GROUP.PHARMACY),
  "bpharm": courseVec(COURSE_GROUP.PHARMACY),
  "b.pharm": courseVec(COURSE_GROUP.PHARMACY),
  "dpharm": courseVec(COURSE_GROUP.PHARMACY),
  "d.pharm": courseVec(COURSE_GROUP.PHARMACY),
  
  // Law
  "law": courseVec(COURSE_GROUP.LAW),
  "llb": courseVec(COURSE_GROUP.LAW),
  "b.a llb": courseVec(COURSE_GROUP.LAW),
  "ba llb": courseVec(COURSE_GROUP.LAW),
  "bcom llb": courseVec(COURSE_GROUP.LAW),
  "b.com llb": courseVec(COURSE_GROUP.LAW),
  "bballb": courseVec(COURSE_GROUP.LAW),
  "bba llb": courseVec(COURSE_GROUP.LAW),
  
  // Management
  "bba": courseVec(COURSE_GROUP.MANAGEMENT),
  "mba": courseVec(COURSE_GROUP.MANAGEMENT),
  "management": courseVec(COURSE_GROUP.MANAGEMENT),
  "business administration": courseVec(COURSE_GROUP.MANAGEMENT),
  
  // Arts/Science/Commerce
  "ba": courseVec(COURSE_GROUP.ARTS),
  "b.a": courseVec(COURSE_GROUP.ARTS),
  "arts": courseVec(COURSE_GROUP.ARTS),
  
  "bsc": courseVec(COURSE_GROUP.SCIENCE),
  "b.sc": courseVec(COURSE_GROUP.SCIENCE),
  "science": courseVec(COURSE_GROUP.SCIENCE),
  
  "bcom": courseVec(COURSE_GROUP.COMMERCE),
  "b.com": courseVec(COURSE_GROUP.COMMERCE),
  "commerce": courseVec(COURSE_GROUP.COMMERCE),
  
  "bca": courseVec(COURSE_GROUP.GEN_DEGREE),
  "bachelor of computer applications": courseVec(COURSE_GROUP.GEN_DEGREE),
  
  "bed": courseVec(COURSE_GROUP.EDUCATION),
  "b.ed": courseVec(COURSE_GROUP.EDUCATION),
  "bachelor of education": courseVec(COURSE_GROUP.EDUCATION),
  
  "agriculture": courseVec(COURSE_GROUP.AGRI),
  "bsc agriculture": courseVec(COURSE_GROUP.AGRI),
  "b.sc agriculture": courseVec(COURSE_GROUP.AGRI),
  
  "polytechnic": courseVec(COURSE_GROUP.POLYTECHNIC),
  "diploma": courseVec(COURSE_GROUP.DIPLOMA),
  
  "degree": courseVec(COURSE_GROUP.GEN_DEGREE),
  "college": courseVec(COURSE_GROUP.GEN_DEGREE)
};

export function embedCourseFromTokens(tokens: string[]): number[] {
  const acc = zeroVec();
  let seen = 0;
  for (const t0 of tokens) {
    const tok = normalizeToken(t0);
    if (!tok) continue;
    let vec = COURSE_VOCAB[tok];
    
    if (!vec) {
      for (const key in COURSE_VOCAB) {
        if (tok === key || tok.startsWith(key) || key.startsWith(tok)) {
          vec = COURSE_VOCAB[key];
          break;
        }
      }
    }
    if (!vec) continue;
    
    const newAcc = addVec(acc, vec);
    for (let i = 0; i < DIM; i++) acc[i] = newAcc[i];
    seen++;
  }
  
  if (seen === 0) return normalizeVec(Array(DIM).fill(0.01));
  return normalizeVec(acc);
}

export function embedCourseText(text: string): number[] {
  const clean = (text || "").replace(_tokenRe, " ");
  let toks = clean.split(/\s+/).filter(Boolean);
  if (toks.length > 40) toks = toks.slice(0, 40);
  return embedCourseFromTokens(toks);
}

// ==============================================================================
// COSINE SIMILARITY
// ==============================================================================
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const L = Math.max(a.length, b.length);
  for (let i = 0; i < L; i++) {
    const ai = a[i] || 0;
    const bi = b[i] || 0;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// ==============================================================================
// LOCALITY COORDS & HAVERSINE (for J&K districts)
// ==============================================================================
export const LOCALITY_COORDS: Record<string, LocalityCoords> = {
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
  kulgam: [33.645000, 75.017778],
  shopian: [33.716944, 74.835833],
  baramulla: [34.202148, 74.348259],
  kishtwar: [33.529580, 76.014620],
  unknown: [0.0, 0.0]
};

export function getDistrictCoords(name: string): LocalityCoords | null {
  if (!name) return null;
  let key = String(name).trim().toLowerCase();
  key = key.replace(/district/g, "").trim();
  
  if (LOCALITY_COORDS[key]) return LOCALITY_COORDS[key];
  
  for (const k in LOCALITY_COORDS) {
    if (key.includes(k)) return LOCALITY_COORDS[k];
  }
  return null;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: LocalityCoords | null, b: LocalityCoords | null): number {
  if (!a || !b) return Infinity;
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const sLat1 = toRad(lat1);
  const sLat2 = toRad(lat2);
  
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(sLat1) * Math.cos(sLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export function distanceBetweenDistricts(d1: string, d2: string): number {
  const c1 = getDistrictCoords(d1);
  const c2 = getDistrictCoords(d2);
  if (!c1 || !c2) return Infinity;
  return haversineKm(c1, c2);
}

// ==============================================================================
// VALUE HELPERS
// ==============================================================================
export function normalizeYesNo(value: any): boolean {
  if (value === null || value === undefined) return false;
  const s = String(value).trim().toLowerCase();
  return ["yes", "y", "true", "1"].includes(s);
}

export function safeNumber(value: any): number {
  if (value === null || value === undefined) return NaN;
  let s = String(value).toLowerCase().trim();
  
  s = s.replace(/,/g, " ").replace(/\s+/g, " ");
  
  const lakhMatch = s.match(/([\d.]+)\s*lakh/);
  if (lakhMatch) {
    const num = parseFloat(lakhMatch[1]);
    if (!isNaN(num)) return num * 100000;
  }
  
  const lacMatch = s.match(/([\d.]+)\s*lac/);
  if (lacMatch) {
    const num = parseFloat(lacMatch[1]);
    if (!isNaN(num)) return num * 100000;
  }
  
  const numStr = s.replace(/[^\d.]/g, "");
  const n = parseFloat(numStr);
  return isNaN(n) ? NaN : n;
}

// ==============================================================================
// BACKWARDS COMPATIBILITY HELPERS
// ==============================================================================
export function studentEventsText(student: any): string {
  const extras = (student.Extra_curriculars || []).join(", ");
  const hobbies = (student.Hobbies || []).join(", ");
  return `The student participates in ${extras}. Their hobbies include ${hobbies}.`;
}

export function normalizeStudentWillVector(willVector: Record<string, number>): Record<string, number> {
  const values = Object.values(willVector).map(v => Number(v) || 0);
  const total = values.reduce((s, v) => s + v, 0);
  if (total === 0) {
    const equal = 1 / values.length;
    const out: Record<string, number> = {};
    Object.keys(willVector).forEach(k => out[k] = Number(equal.toFixed(4)));
    return out;
  }
  const normalized: Record<string, number> = {};
  Object.entries(willVector).forEach(([k, v]) => normalized[k] = Number((v / total).toFixed(4)));
  return normalized;
}
