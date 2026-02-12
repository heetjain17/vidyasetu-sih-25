import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import {
  ArrowLeft,
  Search,
  Briefcase,
  ChevronRight,
  CheckCircle,
  X,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/constants/theme";
import { useCareers } from "@/services/data/hooks/useCareers";
import { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "@/components/Skeleton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Vibrant color palette for careers (light bg, dark border)
const CAREER_COLORS = [
  { bg: "#e0e7ff", border: "#4f46e5", text: "#312e81" }, // Indigo
  { bg: "#fce7f3", border: "#db2777", text: "#831843" }, // Pink
  { bg: "#cffafe", border: "#0891b2", text: "#164e63" }, // Cyan
  { bg: "#d1fae5", border: "#059669", text: "#064e3b" }, // Emerald
  { bg: "#fef3c7", border: "#d97706", text: "#78350f" }, // Amber
  { bg: "#ede9fe", border: "#7c3aed", text: "#4c1d95" }, // Violet
  { bg: "#ffedd5", border: "#ea580c", text: "#7c2d12" }, // Orange
  { bg: "#dbeafe", border: "#2563eb", text: "#1e3a8a" }, // Blue
  { bg: "#fef2f2", border: "#dc2626", text: "#7f1d1d" }, // Red
  { bg: "#ecfdf5", border: "#10b981", text: "#064e3b" }, // Green
];

// Skeleton card component for loading state
const SkeletonCareerCard = ({ theme }: { theme: any }) => (
  <View
    style={{
      width: (SCREEN_WIDTH - 44) / 2,
      height: 150,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderWidth: 2,
      borderColor: theme.colors.border,
    }}
  >
    <Skeleton
      width={32}
      height={32}
      borderRadius={8}
      style={{ marginBottom: 12 }}
    />
    <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
    <Skeleton width="60%" height={12} style={{ marginBottom: 6 }} />
    <Skeleton width="40%" height={12} />
  </View>
);

export default function ExploreCareers() {
  const theme = useTheme();
  const s = styles(theme);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompare, setSelectedCompare] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Fetch from database
  const { careers, loading, error } = useCareers();

  // Filter careers based on search
  const filteredCareers = useMemo(() => {
    if (!searchQuery.trim()) return careers;
    const query = searchQuery.toLowerCase();
    return careers.filter(
      (career) =>
        career.careerName.toLowerCase().includes(query) ||
        career.description?.toLowerCase().includes(query)
    );
  }, [careers, searchQuery]);

  // Toggle compare selection
  const toggleCompare = (id: string) => {
    if (selectedCompare.includes(id)) {
      setSelectedCompare(selectedCompare.filter((c) => c !== id));
    } else if (selectedCompare.length < 3) {
      setSelectedCompare([...selectedCompare, id]);
    }
  };

  // Career Card Component
  const CareerCard = ({
    career,
    index,
  }: {
    career: (typeof careers)[0];
    index: number;
  }) => {
    const isSelected = selectedCompare.includes(String(career.id));
    const colorSet = CAREER_COLORS[index % CAREER_COLORS.length];

    return (
      <TouchableOpacity
        style={[
          s.careerCard,
          { backgroundColor: colorSet.bg, borderColor: colorSet.border },
          isSelected && s.careerCardSelected,
        ]}
        onPress={() =>
          router.push(`/(app)/career-hub/career/${career.id}` as any)
        }
        onLongPress={() => toggleCompare(String(career.id))}
        activeOpacity={0.85}
      >
        <View style={s.cardHeader}>
          <View
            style={[s.cardIcon, { backgroundColor: colorSet.border + "20" }]}
          >
            <Briefcase size={16} color={colorSet.border} />
          </View>
          {isSelected && (
            <View style={s.selectedBadge}>
              <CheckCircle size={16} color="#fff" />
            </View>
          )}
        </View>

        <Text
          style={[s.careerName, { color: colorSet.text }]}
          numberOfLines={2}
        >
          {career.careerName}
        </Text>

        {career.description && (
          <Text
            style={[s.careerDesc, { color: colorSet.text + "bb" }]}
            numberOfLines={2}
          >
            {career.description}
          </Text>
        )}

        <View style={s.viewButton}>
          <Text style={[s.viewButtonText, { color: colorSet.border }]}>
            View Details
          </Text>
          <ChevronRight size={14} color={colorSet.border} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Explore Careers</Text>
          <Text style={s.headerSubtitle}>
            {loading ? "Loading..." : `${careers.length} careers available`}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Search Bar */}
      <View style={s.searchWrapper}>
        <View style={[s.searchBar, isFocused && s.searchFocused]}>
          <Search
            size={20}
            color={
              isFocused ? theme.colors.primary : theme.colors.textSecondary
            }
          />
          <TextInput
            placeholder="Search careers..."
            placeholderTextColor={theme.colors.textSecondary}
            style={s.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Compare Button */}
        {selectedCompare.length >= 2 && (
          <TouchableOpacity
            style={s.compareButton}
            onPress={() => {
              console.log("Compare careers:", selectedCompare);
            }}
          >
            <Text style={s.compareButtonText}>
              Compare {selectedCompare.length} Careers
            </Text>
          </TouchableOpacity>
        )}

        {/* Results Header */}
        <View style={s.resultsHeader}>
          <Text style={s.resultsCount}>
            {loading
              ? "Loading careers..."
              : searchQuery
              ? `${filteredCareers.length} results for "${searchQuery}"`
              : `Showing ${filteredCareers.length} careers`}
          </Text>
          {selectedCompare.length > 0 && (
            <TouchableOpacity onPress={() => setSelectedCompare([])}>
              <Text style={s.clearSelection}>
                Clear ({selectedCompare.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Career Cards */}
        {loading ? (
          <View style={s.careersGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCareerCard key={i} theme={theme} />
            ))}
          </View>
        ) : error ? (
          <View style={s.errorContainer}>
            <Text style={s.errorText}>Failed to load careers</Text>
            <TouchableOpacity style={s.retryButton}>
              <Text style={s.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredCareers.length === 0 ? (
          <View style={s.emptyContainer}>
            <Search size={48} color={theme.colors.textSecondary} />
            <Text style={s.emptyTitle}>No careers found</Text>
            <Text style={s.emptyText}>
              {searchQuery
                ? `No results for "${searchQuery}". Try different keywords.`
                : "No careers available at the moment."}
            </Text>
          </View>
        ) : (
          <View style={s.careersGrid}>
            {filteredCareers.map((career, index) => (
              <CareerCard key={career.id} career={career} index={index} />
            ))}
          </View>
        )}

        {/* Long press hint */}
        {!loading && filteredCareers.length > 0 && (
          <Text style={s.hintText}>
            💡 Long press on cards to add them to compare
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    searchWrapper: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      padding: 14,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: theme.colors.border,
      gap: 12,
    },
    searchFocused: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    scrollContainer: {
      paddingHorizontal: 16,
      paddingBottom: 120,
    },
    compareButton: {
      marginBottom: 16,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      alignItems: "center",
    },
    compareButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },
    resultsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    resultsCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    clearSelection: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    errorContainer: {
      paddingVertical: 60,
      alignItems: "center",
    },
    errorText: {
      color: "#ef4444",
      fontSize: 16,
      marginBottom: 16,
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
    },
    retryText: {
      color: "#fff",
      fontWeight: "600",
    },
    emptyContainer: {
      paddingVertical: 60,
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginTop: 16,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 20,
    },
    careersGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    careerCard: {
      width: (SCREEN_WIDTH - 44) / 2,
      borderRadius: 16,
      padding: 14,
      borderWidth: 2,
      minHeight: 150,
    },
    careerCardSelected: {
      transform: [{ scale: 0.98 }],
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    cardIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    selectedBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "#10b981",
      justifyContent: "center",
      alignItems: "center",
    },
    careerName: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 6,
      lineHeight: 18,
    },
    careerDesc: {
      fontSize: 11,
      lineHeight: 14,
      marginBottom: 10,
    },
    viewButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: "auto",
    },
    viewButtonText: {
      fontSize: 12,
      fontWeight: "600",
    },
    hintText: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 24,
    },
  });
