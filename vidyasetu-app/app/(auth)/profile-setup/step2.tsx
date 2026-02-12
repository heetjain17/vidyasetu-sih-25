import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
} from "react-native";
import { useProfileStore } from "../../../store/profile";
import { useTheme } from "../../../constants/theme";
import { router } from "expo-router";
import ProgressBar from "../../../components/ProgressBar";
import Spacer from "@/components/Spacer";
import { useState } from "react";
import { X, Plus, ArrowLeft } from "lucide-react-native";

export default function ProfileStep2() {
  const theme = useTheme();
  const s = styles(theme);
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  // Local state for adding new items
  const [newExtra, setNewExtra] = useState("");
  const [newHobby, setNewHobby] = useState("");

  const addExtracurricular = () => {
    const trimmed = newExtra.trim();
    if (trimmed && !profile.extracurriculars.includes(trimmed)) {
      updateProfile({
        extracurriculars: [...profile.extracurriculars, trimmed],
      });
      setNewExtra("");
    }
  };

  const removeExtracurricular = (item: string) => {
    updateProfile({
      extracurriculars: profile.extracurriculars.filter((e) => e !== item),
    });
  };

  const addHobby = () => {
    const trimmed = newHobby.trim();
    if (trimmed && !profile.hobbies.includes(trimmed)) {
      updateProfile({
        hobbies: [...profile.hobbies, trimmed],
      });
      setNewHobby("");
    }
  };

  const removeHobby = (item: string) => {
    updateProfile({
      hobbies: profile.hobbies.filter((h) => h !== item),
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.container}>
            <Text style={s.title}>Your Interests</Text>
            <Text style={s.progress}>Step 2 of 3</Text>

            <ProgressBar progress={0.66} />

            <Spacer size={20} />

            {/* Extracurriculars */}
            <Text style={s.label}>Extracurricular Activities</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.textInput}
                value={newExtra}
                onChangeText={setNewExtra}
                placeholder="e.g., coding, debate"
                placeholderTextColor={theme.colors.textSecondary}
                onSubmitEditing={addExtracurricular}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={s.addButton}
                onPress={addExtracurricular}
              >
                <Plus size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <View style={s.tagsContainer}>
              {profile.extracurriculars.map((item) => (
                <View
                  key={item}
                  style={[
                    s.tag,
                    { backgroundColor: theme.colors.primary + "20" },
                  ]}
                >
                  <Text style={[s.tagText, { color: theme.colors.primary }]}>
                    {item}
                  </Text>
                  <TouchableOpacity onPress={() => removeExtracurricular(item)}>
                    <X size={14} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Spacer size={20} />

            {/* Hobbies */}
            <Text style={s.label}>Hobbies</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.textInput}
                value={newHobby}
                onChangeText={setNewHobby}
                placeholder="e.g., reading, gaming"
                placeholderTextColor={theme.colors.textSecondary}
                onSubmitEditing={addHobby}
                returnKeyType="done"
              />
              <TouchableOpacity style={s.addButton} onPress={addHobby}>
                <Plus size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <View style={s.tagsContainer}>
              {profile.hobbies.map((item) => (
                <View
                  key={item}
                  style={[
                    s.tag,
                    { backgroundColor: theme.colors.secondary + "20" },
                  ]}
                >
                  <Text style={[s.tagText, { color: theme.colors.secondary }]}>
                    {item}
                  </Text>
                  <TouchableOpacity onPress={() => removeHobby(item)}>
                    <X size={14} color={theme.colors.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text style={s.hint}>
              These help us match you with colleges that have relevant clubs and
              events.
            </Text>

            <Spacer size={30} />

            <View style={s.buttonRow}>
              <TouchableOpacity
                style={s.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={18} color={theme.colors.text} />
                <Text style={s.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.button}
                onPress={() =>
                  router.push("/(auth)/profile-setup/step3" as any)
                }
              >
                <Text style={s.buttonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 80,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 8,
    },
    progress: {
      fontSize: 14,
      marginBottom: 12,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: "row",
      gap: 8,
    },
    textInput: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      padding: 14,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    addButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      padding: 14,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
    },
    tag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    tagText: {
      fontSize: 14,
      fontWeight: "500",
    },
    hint: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      marginTop: 16,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
    },
    backButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 10,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "600",
    },
    button: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "700",
    },
  });
