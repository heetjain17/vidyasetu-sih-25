// services/sandbox/chatbot.ts - Smart college search chatbot with context validation

import {
  cleanText,
  isGreetingOnly,
  extractDistrict,
  extractBudget,
  extractFacilities,
  extractCategory,
  extractCourseText,
  hasCollegeContext,
  ParsedQuery
} from './text-clean';
import { search, CollegeRow, hasFacility } from './search';
import { embedCourseText, cosineSimilarity } from './utils';
import collegeData from './data/college_data.json';
import embeddingsData from './data/embeddings.json';

const colleges: CollegeRow[] = collegeData as CollegeRow[];
const embIndex: Record<number, number[]> = {};
(embeddingsData as any[]).forEach((e: any) => embIndex[e.id] = e.embedding);

// Helper to get annual fee
function getAnnualFee(row: CollegeRow, category?: string | null): number {
  const categoryKeyMap: Record<string, string> = {
    general: "Fees Annual Rs in Lac General",
    ews: "Fees Annual Rs in Lac EWS",
    sc: "Fees Annual Rs in Lac SC / ST",
    st: "Fees Annual Rs in Lac SC / ST",
    obc: "Fees Annual Rs in Lac OBC"
  };
  
  if (category && categoryKeyMap[category]) {
    const val = parseFloat(String(row[categoryKeyMap[category]] || ""));
    if (!isNaN(val)) return val;
  }
  
  const fallbackFields = [
    "Fees Annual Rs in Lac General",
    "Fees Annual Rs in Lac Others",
    "Fees Annual Rs in Lac Girls",
    "Fees Annual Rs in Lac EWS"
  ];
  for (const key of fallbackFields) {
    const n = parseFloat(String(row[key] || ""));
    if (!isNaN(n)) return n;
  }
  return NaN;
}

export async function chatbotReply(query: string): Promise<string> {
  if (!query || typeof query !== "string") {
    return "❗ Please enter a valid question.";
  }
  
  const q = cleanText(query);
  
  // 1) Handle exit
  if (["bye", "quit", "exit"].includes(q)) {
    return "👋 Goodbye! Have a great day.";
  }
  
  // 2) Greeting only
  if (isGreetingOnly(q)) {
    return (
      "👋 Hello! I can search colleges for you inside Jammu & Kashmir.\n\n" +
      "Examples you can try:\n" +
      "• engineering colleges in Pulwama with hostel\n" +
      "• law colleges in Baramulla under 1 lakh\n" +
      "• medical colleges in Anantnag with placements"
    );
  }
  
  // 3) Block completely unrelated queries
  const district = extractDistrict(q);
  const courseText = extractCourseText(q);
  const contextOK = hasCollegeContext(q) || district || courseText;
  if (!contextOK) {
    return "❗ Please search queries related to colleges in Jammu & Kashmir.";
  }
  
  // 4) Validate location — user mentions a location but NOT in J&K
  if (!district && /in\s+([a-z]+)/i.test(q)) {
    return "⚠ Please search for colleges only within **Jammu & Kashmir districts**.";
  }
  
  // 5) Parse remaining query parts
  const maxBudget = extractBudget(q);
  const facilities = extractFacilities(q);
  const category = extractCategory(q);
  
  const parsedQuery: ParsedQuery = {
    rawQuery: q,
    courseText,
    district,
    maxBudget,
    facilities,
    category
  };
  
  // 6) Perform search
  const results = await search(parsedQuery);
  
  if (!results || results.length === 0) {
    let explanation = "❌ No result found.\n\n";
    
    // 1) Check course availability anywhere
    if (courseText) {
      const qEmb = embedCourseText(courseText);
      const courseMatches = colleges.filter((row, i) => {
        const emb = embIndex[i];
        if (!emb) return false;
        return cosineSimilarity(qEmb, emb) >= 0.35;
      });
      
      if (courseMatches.length === 0) {
        return `❌ No college in Jammu & Kashmir offers **${courseText}**.\n\n` +
          `🔎 Try searching another branch or stream.`;
      }
      
      // 2) Check district availability
      if (district) {
        const districtMatches = courseMatches.filter(row =>
          String(row.District || row.Locality).toLowerCase() === district
        );
        
        if (districtMatches.length === 0) {
          return `❌ Colleges offer **${courseText}**, but not in **${district}**.\n\n` +
            `📌 Try searching:\n• "${courseText} colleges in Kashmir"\n• "${courseText} colleges near me"`;
        }
      }
      
      // 3) Check fees issue
      if (maxBudget) {
        const budgetMatches = courseMatches.filter(row => {
          const fee = getAnnualFee(row, category);
          return !isNaN(fee) && fee <= maxBudget;
        });
        
        if (budgetMatches.length === 0) {
          return (
            `❌ Colleges offer **${courseText}** in ${district || "J&K"}, ` +
            `but the budget **${maxBudget.toLocaleString()}** is too low.\n\n` +
            `💰 Try increasing budget or removing the budget filter.`
          );
        }
      }
      
      // 4) Check category seats
      if (category) {
        const seatMatches = courseMatches.filter(row => {
          const map: Record<string, string> = {
            general: "No of Seats available General",
            sc: "No of Seats available SC / ST",
            st: "No of Seats available SC / ST",
            obc: "No of Seats available OBC",
            ews: "No of Seats available EWS"
          };
          const key = map[category];
          if (key && row[key] != null) return Number(row[key]) > 0;
          return true;
        });
        
        if (seatMatches.length === 0) {
          return (
            `❌ Colleges offer **${courseText}**, but no seats for **${category.toUpperCase()} category** in ` +
            `${district || "J&K"}.\n\n` +
            `🎯 Try removing the category filter.`
          );
        }
      }
      
      // 5) Check facilities
      if (facilities.length > 0) {
        const facMatches = courseMatches.filter(row =>
          facilities.every(fac => hasFacility(row, fac))
        );
        if (facMatches.length === 0) {
          return (
            `❌ Colleges offer **${courseText}**, but ` +
            `do not meet facilities requirement: **${facilities.join(", ")}**.\n\n` +
            `🏫 Try removing facility filters.`
          );
        }
      }
    }
    
    // Fallback if all reasons fail
    return (
      "❌ Filters are too strict — nothing matched.\n\n" +
      "💡 Try removing some filters or changing district/budget."
    );
  }
  
  // 7) Build final human-readable output
  let output = "🏫 **Top Matching Colleges**\n\n";
  
  for (const item of results) {
    const row = item.row;
    
    output += `🎓 **${row.Name || "College Name Unavailable"}**\n`;
    output += `📍 District: ${row.District || row.Locality || "N/A"}\n`;
    output += `📚 Course: ${row["Course offered"] || row["Course_offered"] || row["Courses"] || "Not available"}\n`;
    
    // If distance sorting applied
    if (item.distanceKm !== null) {
      output += `🧭 Distance rank relevance: ~${item.distanceKm} km\n`;
    }
    
    // Budget requested → show fees
    if (parsedQuery.maxBudget) {
      const keys = [
        "Fees Annual Rs in Lac General",
        "Fees Annual Rs in Lac EWS",
        "Fees Annual Rs in Lac OBC",
        "Fees Annual Rs in Lac Girls",
        "Fees Annual Rs in Lac Others"
      ];
      for (const key of keys) {
        if (row[key]) {
          output += `💰 Fees (annual): ${row[key]}\n`;
          break;
        }
      }
    }
    
    // Hostel requested
    if (parsedQuery.facilities.includes("hostel")) {
      const h =
        row["Hostel facility Yes / No"] ||
        row["Hostel"] ||
        "Information not available";
      output += `🏨 Hostel: ${h}\n`;
    }
    
    // Placement requested
    if (parsedQuery.facilities.includes("placement")) {
      const p1 = row["No of student placed through Campus FY 23 24"];
      const avg = row["Average Placement PackageFY 23 24"];
      if (p1) output += `💼 Placements (2023-24): ${p1} students\n`;
      if (avg) output += `📦 Avg Package (2023-24): ${avg}\n`;
    }
    
    output += `⭐ Match Score: ${item.score}\n\n`;
  }
  
  return output.trim();
}
