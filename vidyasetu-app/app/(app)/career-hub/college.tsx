import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Linking,
  Dimensions,
} from "react-native";
import {
  ArrowLeft,
  Search,
  MapPin,
  Building2,
  Calendar,
  CheckCircle,
  X,
  Scale,
  Globe,
  Users,
  GraduationCap,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/constants/theme";
import {
  useColleges,
  useDistricts,
  College,
} from "@/services/data/hooks/useColleges";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "@/components/Skeleton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Skeleton college card component
const SkeletonCollegeCard = ({ theme }: { theme: any }) => (
  <View
    style={{
      width: (SCREEN_WIDTH - 44) / 2,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    }}
  >
    <Skeleton
      width={40}
      height={40}
      borderRadius={12}
      style={{ marginBottom: 12 }}
    />
    <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
    <Skeleton width="60%" height={12} style={{ marginBottom: 6 }} />
    <Skeleton width="50%" height={12} style={{ marginBottom: 8 }} />
    <Skeleton width={70} height={24} borderRadius={6} />
  </View>
);

export default function CollegeFinder() {
  const theme = useTheme();
  const s = styles(theme);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [forGirlsOnly, setForGirlsOnly] = useState(false);
  const [selectedCompare, setSelectedCompare] = useState<College[]>([]);
  const [detailCollege, setDetailCollege] = useState<College | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const { colleges, loading } = useColleges();
  const { districts } = useDistricts();

  const filteredColleges = useMemo(() => {
    let result = colleges;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.district?.toLowerCase().includes(query) ||
          c.university_name?.toLowerCase().includes(query)
      );
    }
    if (selectedDistrict)
      result = result.filter((c) => c.district === selectedDistrict);
    if (forGirlsOnly) result = result.filter((c) => c.for_girls === 1);
    return result;
  }, [colleges, searchQuery, selectedDistrict, forGirlsOnly]);

  const toggleCompare = (college: College) => {
    const exists = selectedCompare.find((c) => c.id === college.id);
    if (exists)
      setSelectedCompare(selectedCompare.filter((c) => c.id !== college.id));
    else if (selectedCompare.length < 3)
      setSelectedCompare([...selectedCompare, college]);
  };

  const CollegeCard = ({ college }: { college: College }) => {
    const isSelected = selectedCompare.some((c) => c.id === college.id);
    return (
      <TouchableOpacity
        style={[s.collegeCard, isSelected && s.collegeCardSelected]}
        onPress={() => toggleCompare(college)}
        activeOpacity={0.7}
      >
        <View style={s.cardHeader}>
          <View style={[s.cardIcon, college.for_girls === 1 && s.girlsIcon]}>
            {college.for_girls === 1 ? (
              <Users size={20} color="#ec4899" />
            ) : (
              <Building2 size={20} color={theme.colors.primary} />
            )}
          </View>
          {isSelected && <CheckCircle size={18} color={theme.colors.primary} />}
        </View>
        <Text style={s.collegeName} numberOfLines={2}>
          {college.name}
        </Text>
        <View style={s.cardMeta}>
          <MapPin size={12} color={theme.colors.textSecondary} />
          <Text style={s.metaText}>{college.district}</Text>
        </View>
        {college.year_of_establishment && (
          <View style={s.cardMeta}>
            <Calendar size={12} color={theme.colors.textSecondary} />
            <Text style={s.metaText}>Est. {college.year_of_establishment}</Text>
          </View>
        )}
        {college.for_girls === 1 && (
          <View style={s.girlsBadge}>
            <Text style={s.girlsBadgeText}>Women's</Text>
          </View>
        )}
        <TouchableOpacity
          style={s.viewDetailsBtn}
          onPress={() => setDetailCollege(college)}
        >
          <Text style={s.viewDetailsText}>View Details →</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value?: string | null;
  }) => {
    if (!value) return null;
    return (
      <View style={s.infoItem}>
        <Icon size={16} color={theme.colors.textSecondary} />
        <View>
          <Text style={s.infoLabel}>{label}</Text>
          <Text style={s.infoValue}>{value}</Text>
        </View>
      </View>
    );
  };

  const CompareRow = ({
    label,
    values,
  }: {
    label: string;
    values: (string | null | undefined)[];
  }) => (
    <View style={s.compareRow}>
      <View style={s.compareLabel}>
        <Text style={s.compareLabelText}>{label}</Text>
      </View>
      {values.map((v, i) => (
        <View key={i} style={s.compareCell}>
          <Text style={s.compareCellText}>{v || "N/A"}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Explore Colleges</Text>
        <Text style={s.headerCount}>
          {loading ? "..." : filteredColleges.length}
        </Text>
      </View>

      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Search size={18} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Search colleges..."
            placeholderTextColor={theme.colors.textSecondary}
            style={s.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
      >
        <TouchableOpacity
          style={[s.filterChip, forGirlsOnly && s.filterChipActive]}
          onPress={() => setForGirlsOnly(!forGirlsOnly)}
        >
          <Users
            size={14}
            color={forGirlsOnly ? "#fff" : theme.colors.textSecondary}
          />
          <Text
            style={[s.filterChipText, forGirlsOnly && s.filterChipTextActive]}
          >
            Women's Only
          </Text>
        </TouchableOpacity>
        {districts.slice(0, 5).map((d) => (
          <TouchableOpacity
            key={d}
            style={[s.filterChip, selectedDistrict === d && s.filterChipActive]}
            onPress={() =>
              setSelectedDistrict(selectedDistrict === d ? null : d)
            }
          >
            <Text
              style={[
                s.filterChipText,
                selectedDistrict === d && s.filterChipTextActive,
              ]}
            >
              {d}
            </Text>
          </TouchableOpacity>
        ))}
        {(selectedDistrict || forGirlsOnly) && (
          <TouchableOpacity
            style={s.clearBtn}
            onPress={() => {
              setSelectedDistrict(null);
              setForGirlsOnly(false);
            }}
          >
            <Text style={s.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {selectedCompare.length > 0 && (
        <TouchableOpacity
          style={s.compareBtn}
          onPress={() => setShowCompare(true)}
        >
          <Scale size={18} color="#fff" />
          <Text style={s.compareBtnText}>
            Compare ({selectedCompare.length})
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContainer}
      >
        {loading ? (
          <View style={s.grid}>
            <SkeletonCollegeCard theme={theme} />
            <SkeletonCollegeCard theme={theme} />
            <SkeletonCollegeCard theme={theme} />
            <SkeletonCollegeCard theme={theme} />
          </View>
        ) : (
          <>
            <View style={s.grid}>
              {filteredColleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </View>
            {filteredColleges.length === 0 && (
              <View style={s.emptyState}>
                <GraduationCap size={48} color={theme.colors.textSecondary} />
                <Text style={s.emptyText}>No colleges found</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!detailCollege} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <TouchableOpacity
              style={s.modalClose}
              onPress={() => setDetailCollege(null)}
            >
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
            {detailCollege && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={[
                    s.modalIcon,
                    detailCollege.for_girls === 1 && s.girlsModalIcon,
                  ]}
                >
                  {detailCollege.for_girls === 1 ? (
                    <Users size={32} color="#ec4899" />
                  ) : (
                    <Building2 size={32} color={theme.colors.primary} />
                  )}
                </View>
                <Text style={s.modalTitle}>{detailCollege.name}</Text>
                {detailCollege.for_girls === 1 && (
                  <View style={s.girlsBadgeLarge}>
                    <Text style={s.girlsBadgeTextLarge}>Women's College</Text>
                  </View>
                )}
                <View style={s.infoGrid}>
                  <InfoItem
                    icon={MapPin}
                    label="District"
                    value={detailCollege.district}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Location"
                    value={detailCollege.location}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Established"
                    value={detailCollege.year_of_establishment?.toString()}
                  />
                  <InfoItem
                    icon={Building2}
                    label="Type"
                    value={detailCollege.college_type}
                  />
                  <InfoItem
                    icon={GraduationCap}
                    label="Management"
                    value={detailCollege.management}
                  />
                  <InfoItem
                    icon={Building2}
                    label="University"
                    value={detailCollege.university_name}
                  />
                </View>
                {detailCollege.website && (
                  <TouchableOpacity
                    style={s.websiteBtn}
                    onPress={() =>
                      Linking.openURL(`https://${detailCollege.website}`)
                    }
                  >
                    <Globe size={18} color="#fff" />
                    <Text style={s.websiteBtnText}>Visit Website</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Compare Modal */}
      <Modal visible={showCompare} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.compareContent}>
            <View style={s.compareHeader}>
              <View style={s.compareHeaderLeft}>
                <Scale size={20} color={theme.colors.primary} />
                <Text style={s.compareTitle}>Compare Colleges</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCompare(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={s.compareRow}>
                  <View style={s.compareLabel}>
                    <Text style={s.compareLabelText}>Name</Text>
                  </View>
                  {selectedCompare.map((c) => (
                    <View key={c.id} style={s.compareCell}>
                      <Text style={s.compareCellBold} numberOfLines={2}>
                        {c.name}
                      </Text>
                    </View>
                  ))}
                </View>
                <CompareRow
                  label="District"
                  values={selectedCompare.map((c) => c.district)}
                />
                <CompareRow
                  label="Location"
                  values={selectedCompare.map((c) => c.location)}
                />
                <CompareRow
                  label="Established"
                  values={selectedCompare.map((c) =>
                    c.year_of_establishment?.toString()
                  )}
                />
                <CompareRow
                  label="Type"
                  values={selectedCompare.map((c) => c.college_type)}
                />
                <CompareRow
                  label="Management"
                  values={selectedCompare.map((c) => c.management)}
                />
                <CompareRow
                  label="University"
                  values={selectedCompare.map((c) => c.university_name)}
                />
                <CompareRow
                  label="Women's"
                  values={selectedCompare.map((c) =>
                    c.for_girls === 1 ? "Yes" : "No"
                  )}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    headerCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    searchRow: { paddingHorizontal: 16, marginBottom: 12 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    searchInput: { flex: 1, fontSize: 15, color: theme.colors.text },
    filterScroll: { paddingLeft: 16, marginBottom: 12, maxHeight: 40 },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterChipText: { fontSize: 13, color: theme.colors.textSecondary },
    filterChipTextActive: { color: "#fff" },
    clearBtn: { paddingHorizontal: 12, paddingVertical: 8 },
    clearBtnText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    compareBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      marginHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginBottom: 12,
    },
    compareBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
    scrollContainer: { paddingHorizontal: 16, paddingBottom: 100 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    collegeCard: {
      width: (SCREEN_WIDTH - 44) / 2,
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    collegeCardSelected: { borderColor: theme.colors.primary, borderWidth: 2 },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: theme.colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
    },
    girlsIcon: { backgroundColor: "#ec489915" },
    collegeName: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
      lineHeight: 18,
    },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 4,
    },
    metaText: { fontSize: 11, color: theme.colors.textSecondary },
    girlsBadge: {
      alignSelf: "flex-start",
      backgroundColor: "#ec489920",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginTop: 6,
    },
    girlsBadgeText: { fontSize: 10, color: "#ec4899", fontWeight: "600" },
    viewDetailsBtn: { marginTop: 10 },
    viewDetailsText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    inlineLoading: { paddingVertical: 60, alignItems: "center" },
    loadingText: {
      marginTop: 12,
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    emptyState: { alignItems: "center", paddingVertical: 60 },
    emptyText: {
      marginTop: 12,
      color: theme.colors.textSecondary,
      fontSize: 15,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: "85%",
    },
    modalClose: { position: "absolute", right: 16, top: 16, zIndex: 10 },
    modalIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      alignSelf: "center",
    },
    girlsModalIcon: { backgroundColor: "#ec489915" },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    girlsBadgeLarge: {
      alignSelf: "center",
      backgroundColor: "#ec489920",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 16,
    },
    girlsBadgeTextLarge: { fontSize: 12, color: "#ec4899", fontWeight: "600" },
    infoGrid: { gap: 12, marginBottom: 20 },
    infoItem: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
      backgroundColor: theme.colors.surface,
      padding: 12,
      borderRadius: 10,
    },
    infoLabel: { fontSize: 11, color: theme.colors.textSecondary },
    infoValue: { fontSize: 14, color: theme.colors.text, fontWeight: "500" },
    websiteBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
    },
    websiteBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
    compareContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: "80%",
    },
    compareHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    compareHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    compareTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
    compareRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    compareLabel: {
      width: 100,
      padding: 12,
      backgroundColor: theme.colors.surface,
    },
    compareLabelText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    compareCell: { width: 140, padding: 12 },
    compareCellText: { fontSize: 13, color: theme.colors.text },
    compareCellBold: {
      fontSize: 13,
      color: theme.colors.text,
      fontWeight: "600",
    },
  });
