// services/offlineChatbot.ts
// Enhanced Offline chatbot with pattern matching + TF-IDF search
// Works completely offline with bundled data

import searchDictionary from "@/data/search_dictionary.json";
import universalIndex from "@/data/universal_index.json";

// ==================== Types ====================

interface SearchResult {
  type: "college" | "career" | "question" | "course";
  score: number;
  metadata: any;
}

interface IndexDoc {
  type: string;
  vec: Record<string, number>;
  metadata: any;
}

// ==================== Constants ====================

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "of",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "is",
  "it",
  "this",
  "that",
  "are",
  "was",
  "be",
  "as",
  "by",
  "from",
  "which",
  "who",
  "whom",
  "i",
  "me",
  "my",
  "can",
  "you",
  "your",
  "what",
  "how",
  "where",
  "when",
  "why",
  "do",
  "does",
  "did",
  "will",
  "would",
  "should",
  "could",
  "have",
  "has",
  "had",
  "about",
  "want",
  "need",
  "like",
  "tell",
  "show",
  "give",
  "find",
  "get",
  "know",
  "help",
  "please",
]);

const GREETING_WORDS = new Set([
  "hi",
  "hello",
  "hey",
  "yo",
  "namaste",
  "salam",
  "good",
  "morning",
  "evening",
  "afternoon",
]);

const THANKS_WORDS = new Set([
  "thanks",
  "thank",
  "thankyou",
  "thx",
  "ty",
  "appreciate",
]);

// J&K Districts for location detection
const JK_DISTRICTS = [
  "srinagar",
  "jammu",
  "anantnag",
  "baramulla",
  "budgam",
  "ganderbal",
  "pulwama",
  "shopian",
  "kulgam",
  "bandipora",
  "kupwara",
  "udhampur",
  "kathua",
  "doda",
  "kishtwar",
  "ramban",
  "reasi",
  "rajouri",
  "poonch",
  "samba",
];

// ==================== Text Processing ====================

function cleanText(text: string): string {
  return (text || "").toLowerCase().trim();
}

function tokenize(text: string): string[] {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .filter((t) => !STOP_WORDS.has(t));
}

function isGreetingOnly(text: string): boolean {
  const tokens = cleanText(text).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  return tokens.every((word) => GREETING_WORDS.has(word));
}

function isThanks(text: string): boolean {
  const tokens = cleanText(text).split(/\s+/).filter(Boolean);
  return tokens.some((word) => THANKS_WORDS.has(word));
}

function extractDistrict(text: string): string | null {
  const q = cleanText(text);
  for (const d of JK_DISTRICTS) {
    if (q.includes(d)) return d;
  }
  return null;
}

// ==================== Pattern Matching for Standard Queries ====================

interface PatternResponse {
  match: boolean;
  response?: string;
  searchType?: string;
  searchQuery?: string;
}

function matchStandardPatterns(query: string): PatternResponse {
  const q = cleanText(query);

  // === About the chatbot ===
  if (/who are you|what are you|your name|introduce yourself/.test(q)) {
    return {
      match: true,
      response:
        "🤖 I'm VidyaSetu Assistant!\n\nI help students in J&K with:\n• Finding colleges and courses\n• Career guidance and roadmaps\n• Answering aptitude questions\n\nAsk me anything about education!",
    };
  }

  // === What can you do ===
  if (
    /what can you do|what do you do|how can you help|your capabilities/.test(q)
  ) {
    return {
      match: true,
      response:
        "📚 **I can help you with:**\n\n" +
        "🏫 **Colleges** - Find colleges in any J&K district\n" +
        "💼 **Careers** - Explore career paths and requirements\n" +
        "📖 **Courses** - Discover courses like Engineering, Medical, Law\n" +
        "🎯 **Aptitude** - Practice with sample questions\n\n" +
        "**Try asking:**\n• 'Engineering colleges in Srinagar'\n• 'How to become a doctor'\n• 'B.Tech courses'",
    };
  }

  // === Career "How to become" patterns ===
  const becomeMatch = q.match(/how (?:to|do i|can i) become (?:a |an )?(.+)/);
  if (becomeMatch) {
    const career = becomeMatch[1].trim();
    return {
      match: true,
      searchType: "career",
      searchQuery: career,
    };
  }

  // === Best/Top colleges patterns ===
  if (/best|top|good/.test(q) && /college|institute|university/.test(q)) {
    const district = extractDistrict(q);
    return {
      match: true,
      searchType: "college",
      searchQuery: district ? `college ${district}` : "college",
    };
  }

  // === Colleges in [district] ===
  if (/college|institute/.test(q)) {
    const district = extractDistrict(q);
    if (district) {
      return {
        match: true,
        searchType: "college",
        searchQuery: `college ${district}`,
      };
    }
  }

  // === Course-related queries ===
  const courseMatch = q.match(
    /(?:about|what is|tell me about) (.+?) (?:course|degree|program)/
  );
  if (
    courseMatch ||
    (/course|degree|program/.test(q) &&
      /engineering|medical|law|btech|mbbs|bba|bca/.test(q))
  ) {
    return {
      match: true,
      searchType: "course",
      searchQuery: q,
    };
  }

  // === Eligibility/Admission queries ===
  if (/eligibility|admission|how to get into|requirements for/.test(q)) {
    return {
      match: true,
      searchQuery: q,
    };
  }

  // === Fees queries ===
  if (/fees|cost|tuition|affordable|cheap|budget/.test(q)) {
    const district = extractDistrict(q);
    return {
      match: true,
      searchType: "college",
      searchQuery: district
        ? `college ${district} fees`
        : "college fees affordable",
    };
  }

  // === Hostel queries ===
  if (/hostel|accommodation|stay|living/.test(q)) {
    const district = extractDistrict(q);
    return {
      match: true,
      searchType: "college",
      searchQuery: district ? `college ${district} hostel` : "college hostel",
    };
  }

  return { match: false };
}

// ==================== TF-IDF Search ====================

function computeQueryVector(text: string): Record<string, number> {
  const tokens = tokenize(text);
  if (!tokens.length) return {};

  const vec: Record<string, number> = {};
  const dictionary = searchDictionary as Record<string, number>;

  tokens.forEach((t) => {
    if (dictionary[t]) {
      vec[t] = (vec[t] || 0) + 1;
    }
  });

  const len = tokens.length;
  for (const k in vec) {
    vec[k] = (vec[k] / len) * dictionary[k];
  }
  return vec;
}

function cosineSimilaritySparse(
  v1: Record<string, number>,
  v2: Record<string, number>
): number {
  let dot = 0,
    mag1 = 0,
    mag2 = 0;

  for (const k in v1) mag1 += v1[k] * v1[k];
  for (const k in v2) mag2 += v2[k] * v2[k];

  if (mag1 === 0 || mag2 === 0) return 0;

  for (const k in v1) {
    if (v2[k]) dot += v1[k] * v2[k];
  }

  return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

function search(
  query: string,
  options: { type?: string; limit?: number } = {}
): SearchResult[] {
  const qVec = computeQueryVector(query);
  const limit = options.limit || 5;
  const index = universalIndex as IndexDoc[];

  const results: { doc: IndexDoc; score: number }[] = [];

  for (const doc of index) {
    if (options.type && doc.type !== options.type) continue;

    const score = cosineSimilaritySparse(qVec, doc.vec);
    if (score > 0.01) {
      results.push({ doc, score });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit).map((r) => ({
    type: r.doc.type as SearchResult["type"],
    score: parseFloat(r.score.toFixed(4)),
    metadata: r.doc.metadata,
  }));
}

// ==================== Format Search Results ====================

function formatResults(results: SearchResult[], queryType?: string): string {
  if (!results || results.length === 0) {
    return "";
  }

  let output = "";

  for (const item of results) {
    const meta = item.metadata;
    const score = Math.round(item.score * 100);

    if (item.type === "college") {
      const name = meta.name || meta.Name || "College";
      const location = meta.district || meta.Locality || "J&K";
      const type = meta.college_type || meta.Management || "";
      const hostel = meta.Hostel || meta["Hostel facility Yes / No"] || "N/A";

      output += `🏫 **${name}**\n`;
      output += `   📍 Location: ${location}\n`;
      if (type) output += `   🏛 Type: ${type}\n`;
      output += `   🏨 Hostel: ${hostel}\n`;
      output += `   ⭐ Match: ${score}%\n\n`;
    } else if (item.type === "career") {
      output += `💼 **${meta.title}**\n`;
      if (meta.desc) {
        const shortDesc =
          meta.desc.length > 100 ? meta.desc.slice(0, 100) + "..." : meta.desc;
        output += `   ${shortDesc}\n`;
      }
      if (meta.courses && meta.courses.length > 0) {
        const courses = meta.courses.slice(0, 4).join(", ");
        output += `   📚 Recommended: ${courses}\n`;
      }
      output += `\n`;
    } else if (item.type === "course") {
      output += `📘 **${meta.name}**\n`;
      if (meta.stream) output += `   📂 Stream: ${meta.stream}\n`;
      output += `\n`;
    } else if (item.type === "question") {
      output += `❓ **Sample Question:**\n`;
      const text =
        meta.text?.length > 150 ? meta.text.slice(0, 150) + "..." : meta.text;
      output += `   "${text}"\n\n`;
    }
  }

  return output;
}

// ==================== Main Chatbot Reply ====================

export function chatbotReply(query: string): string {
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return "❗ Please enter a question or topic you'd like to explore.";
  }

  const q = cleanText(query);

  // Handle exit
  if (
    ["bye", "quit", "exit", "goodbye", "see you"].some((w) => q.includes(w))
  ) {
    return "👋 Goodbye! Best of luck with your career journey. Feel free to come back anytime!";
  }

  // Handle thanks
  if (isThanks(q)) {
    return "😊 You're welcome! Feel free to ask if you have more questions about colleges, careers, or courses.";
  }

  // Handle greetings
  if (isGreetingOnly(q)) {
    return (
      "👋 **Hello! I'm VidyaSetu Assistant**\n\n" +
      "I can help you explore:\n" +
      "• 🏫 Colleges in Jammu & Kashmir\n" +
      "• 💼 Career paths and guidance\n" +
      "• 📚 Courses and programs\n" +
      "• ❓ Aptitude practice questions\n\n" +
      "**What would you like to know?**"
    );
  }

  // Check for standard patterns
  const patternResult = matchStandardPatterns(q);

  if (patternResult.match) {
    // Direct response (no search needed)
    if (patternResult.response) {
      return patternResult.response;
    }

    // Pattern-guided search
    if (patternResult.searchQuery) {
      const results = search(patternResult.searchQuery, {
        type: patternResult.searchType,
        limit: 5,
      });

      const formatted = formatResults(results, patternResult.searchType);
      if (formatted) {
        const header =
          patternResult.searchType === "college"
            ? "🏫 **Colleges Found:**\n\n"
            : patternResult.searchType === "career"
            ? "💼 **Career Information:**\n\n"
            : patternResult.searchType === "course"
            ? "📘 **Courses Found:**\n\n"
            : "🔎 **Here's what I found:**\n\n";

        return header + formatted.trim();
      }
    }
  }

  // Fallback: General TF-IDF search
  const results = search(q, { limit: 5 });

  if (!results || results.length === 0) {
    return (
      "🤔 I couldn't find specific information for that query.\n\n" +
      "**Try asking about:**\n" +
      "• Colleges: 'Engineering colleges in Srinagar'\n" +
      "• Careers: 'How to become a doctor'\n" +
      "• Courses: 'B.Tech computer science'\n" +
      "• Districts: 'Colleges in Jammu'"
    );
  }

  // Format and return results
  const formatted = formatResults(results);
  return "🔎 **Search Results:**\n\n" + formatted.trim();
}

export { search };
export default { chatbotReply, search };
