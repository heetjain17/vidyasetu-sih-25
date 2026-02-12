import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../constants/theme";
import {
  User,
  Heart,
  Sliders,
  Save,
  ArrowLeft,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "../store/profile";
import { Picker } from "@react-native-picker/picker";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const CATEGORY_OPTIONS = ["General", "OBC", "SC", "ST", "EWS"];
const GRADE_OPTIONS = ["9th", "10th", "11th", "12th", "Graduate"];
const BOARD_OPTIONS = ["CBSE", "ICSE", "State Board", "IB", "Other"];
const DISTRICTS = [
  "Srinagar",
  "Jammu",
  "Anantnag",
  "Baramulla",
  "Pulwama",
  "Kupwara",
  "Budgam",
  "Ganderbal",
  "Bandipora",
  "Shopian",
  "Kulgam",
  "Doda",
  "Kishtwar",
  "Ramban",
  "Reasi",
  "Udhampur",
  "Kathua",
  "Samba",
  "Poonch",
  "Rajouri",
];

const HOBBY_SUGGESTIONS = [
  "Reading",
  "Sports",
  "Music",
  "Art",
  "Gaming",
  "Photography",
  "Cooking",
  "Travel",
  "Writing",
  "Dance",
  "Coding",
  "Gardening",
];

export default function Profile() {
  const theme = useTheme();
  const s = styles(theme);
  const { t } = useTranslation("common");
  const { profile, updateProfile } = useProfileStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState(profile.fullName || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [district, setDistrict] = useState(profile.district || "");
  const [category, setCategory] = useState(profile.category || "");
  const [grade, setGrade] = useState(profile.grade || "");
  const [board, setBoard] = useState(profile.board || "");
  const [hobbies, setHobbies] = useState<string[]>(profile.hobbies || []);
  const [newHobby, setNewHobby] = useState("");

  // Preferences
  const [localityPref, setLocalityPref] = useState(3);
  const [financialPref, setFinancialPref] = useState(3);
  const [eligibilityPref, setEligibilityPref] = useState(3);
  const [eventsPref, setEventsPref] = useState(3);
  const [qualityPref, setQualityPref] = useState(3);

  useEffect(() => {
    // Sync form with profile store
    setFullName(profile.fullName || "");
    setGender(profile.gender || "");
    setDistrict(profile.district || "");
    setCategory(profile.category || "");
    setGrade(profile.grade || "");
    setBoard(profile.board || "");
    setHobbies(profile.hobbies || []);
  }, [profile]);

  const addHobby = (hobby: string) => {
    if (hobby && !hobbies.includes(hobby)) {
      setHobbies([...hobbies, hobby]);
    }
    setNewHobby("");
  };

  const removeHobby = (hobby: string) => {
    setHobbies(hobbies.filter((h) => h !== hobby));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Update profile store
      updateProfile({
        fullName,
        gender,
        district,
        category,
        grade,
        board,
        hobbies,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(t("profile.updateFailed"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={s.title}>{t("profile.title")}</Text>
          <TouchableOpacity
            style={s.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Save size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Status Messages */}
        {error && (
          <View style={s.errorMessage}>
            <AlertCircle size={18} color="#EF4444" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={s.successMessage}>
            <CheckCircle size={18} color="#10B981" />
            <Text style={s.successText}>{t("profile.updateSuccess")}</Text>
          </View>
        )}

        {/* Personal Information */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIcon, { backgroundColor: "#3B82F620" }]}>
              <User size={20} color="#3B82F6" />
            </View>
            <Text style={s.sectionTitle}>{t("profile.personalInfo")}</Text>
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>{t("profile.fullName")}</Text>
            <TextInput
              style={s.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>{t("profile.gender")}</Text>
            <View style={s.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={setGender}
                style={s.picker}
                dropdownIconColor={theme.colors.text}
              >
                <Picker.Item label="Select gender" value="" />
                {GENDER_OPTIONS.map((g) => (
                  <Picker.Item key={g} label={g} value={g} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>{t("profile.district")}</Text>
            <View style={s.pickerContainer}>
              <Picker
                selectedValue={district}
                onValueChange={setDistrict}
                style={s.picker}
                dropdownIconColor={theme.colors.text}
              >
                <Picker.Item label="Select district" value="" />
                {DISTRICTS.map((d) => (
                  <Picker.Item key={d} label={d} value={d} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>{t("profile.category")}</Text>
            <View style={s.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={s.picker}
                dropdownIconColor={theme.colors.text}
              >
                <Picker.Item label="Select category" value="" />
                {CATEGORY_OPTIONS.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={s.fieldRow}>
            <View style={[s.fieldGroup, { flex: 1 }]}>
              <Text style={s.label}>{t("profile.grade")}</Text>
              <View style={s.pickerContainer}>
                <Picker
                  selectedValue={grade}
                  onValueChange={setGrade}
                  style={s.picker}
                  dropdownIconColor={theme.colors.text}
                >
                  <Picker.Item label="Select" value="" />
                  {GRADE_OPTIONS.map((g) => (
                    <Picker.Item key={g} label={g} value={g} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={[s.fieldGroup, { flex: 1 }]}>
              <Text style={s.label}>{t("profile.board")}</Text>
              <View style={s.pickerContainer}>
                <Picker
                  selectedValue={board}
                  onValueChange={setBoard}
                  style={s.picker}
                  dropdownIconColor={theme.colors.text}
                >
                  <Picker.Item label="Select" value="" />
                  {BOARD_OPTIONS.map((b) => (
                    <Picker.Item key={b} label={b} value={b} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Hobbies */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIcon, { backgroundColor: "#EC489920" }]}>
              <Heart size={20} color="#EC4899" />
            </View>
            <Text style={s.sectionTitle}>{t("profile.hobbies")}</Text>
          </View>

          {/* Selected hobbies */}
          <View style={s.tagsContainer}>
            {hobbies.map((hobby) => (
              <View key={hobby} style={s.tag}>
                <Text style={s.tagText}>{hobby}</Text>
                <TouchableOpacity onPress={() => removeHobby(hobby)}>
                  <X size={14} color="#EC4899" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Add hobby input */}
          <View style={s.addRow}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={newHobby}
              onChangeText={setNewHobby}
              placeholder={t("profile.addHobby")}
              placeholderTextColor={theme.colors.textSecondary}
              onSubmitEditing={() => addHobby(newHobby)}
            />
            <TouchableOpacity
              style={s.addButton}
              onPress={() => addHobby(newHobby)}
            >
              <Plus size={20} color="#EC4899" />
            </TouchableOpacity>
          </View>

          {/* Suggestions */}
          <View style={s.suggestionsContainer}>
            {HOBBY_SUGGESTIONS.filter((h) => !hobbies.includes(h)).map(
              (hobby) => (
                <TouchableOpacity
                  key={hobby}
                  style={s.suggestion}
                  onPress={() => addHobby(hobby)}
                >
                  <Text style={s.suggestionText}>+ {hobby}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIcon, { backgroundColor: "#F9731620" }]}>
              <Sliders size={20} color="#F97316" />
            </View>
            <Text style={s.sectionTitle}>{t("profile.preferences")}</Text>
          </View>

          <Text style={s.prefDesc}>{t("profile.preferencesDesc")}</Text>

          {[
            {
              key: "locality",
              label: t("profile.locationPref"),
              value: localityPref,
              setter: setLocalityPref,
            },
            {
              key: "financial",
              label: t("profile.financialFit"),
              value: financialPref,
              setter: setFinancialPref,
            },
            {
              key: "eligibility",
              label: t("profile.eligibilityMatch"),
              value: eligibilityPref,
              setter: setEligibilityPref,
            },
            {
              key: "events",
              label: t("profile.eventsHobbies"),
              value: eventsPref,
              setter: setEventsPref,
            },
            {
              key: "quality",
              label: t("profile.qualityRep"),
              value: qualityPref,
              setter: setQualityPref,
            },
          ].map((pref) => (
            <View key={pref.key} style={s.prefItem}>
              <View style={s.prefHeader}>
                <Text style={s.prefLabel}>{pref.label}</Text>
                <Text style={s.prefValue}>{pref.value}</Text>
              </View>
              <View style={s.sliderContainer}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      s.sliderDot,
                      pref.value >= num && s.sliderDotActive,
                    ]}
                    onPress={() => pref.setter(num)}
                  />
                ))}
              </View>
              <View style={s.sliderLabels}>
                <Text style={s.sliderLabel}>{t("profile.notImportant")}</Text>
                <Text style={s.sliderLabel}>{t("profile.veryImportant")}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingTop: 50,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 20,
    },
    backButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.container,
    },
    title: {
      flex: 1,
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text,
    },
    saveButton: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
    },
    errorMessage: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 14,
      backgroundColor: "#EF444420",
      borderRadius: 12,
      marginBottom: 16,
    },
    errorText: {
      color: "#EF4444",
      fontSize: 14,
    },
    successMessage: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 14,
      backgroundColor: "#10B98120",
      borderRadius: 12,
      marginBottom: 16,
    },
    successText: {
      color: "#10B981",
      fontSize: 14,
    },
    section: {
      backgroundColor: theme.colors.container,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    fieldGroup: {
      marginBottom: 16,
    },
    fieldRow: {
      flexDirection: "row",
      gap: 12,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pickerContainer: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    picker: {
      color: theme.colors.text,
      height: 50,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    tag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: "#EC489920",
      borderRadius: 20,
    },
    tagText: {
      color: "#EC4899",
      fontSize: 14,
      fontWeight: "500",
    },
    addRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 16,
    },
    addButton: {
      padding: 14,
      backgroundColor: "#EC489920",
      borderRadius: 12,
    },
    suggestionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    suggestion: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    suggestionText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
    prefDesc: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      marginBottom: 20,
      lineHeight: 18,
    },
    prefItem: {
      marginBottom: 20,
    },
    prefHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    prefLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
    prefValue: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    sliderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    sliderDot: {
      width: 40,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.inputBackground,
    },
    sliderDotActive: {
      backgroundColor: theme.colors.primary,
    },
    sliderLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    sliderLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
  });
