import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  TextInput,
} from "react-native";
import Input from "../../../components/Input";
import {
  useProfileStore,
  LOCALITIES,
  CATEGORIES,
  GENDERS,
} from "../../../store/profile";
import { useTheme } from "../../../constants/theme";
import { router } from "expo-router";
import ProgressBar from "../../../components/ProgressBar";
import Spacer from "@/components/Spacer";
import Accordion from "@/components/Accordion";
import { useState } from "react";

export default function ProfileStep1() {
  const theme = useTheme();
  const s = styles(theme);
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [errors, setErrors] = useState({
    fullName: "",
    gender: "",
    locality: "",
    category: "",
    budget: "",
  });

  const validateStep1 = () => {
    let valid = true;
    const newErrors: any = {};

    if (!profile.fullName) {
      newErrors.fullName = "Full name is required";
      valid = false;
    }
    if (!profile.gender) {
      newErrors.gender = "Please select your gender";
      valid = false;
    }
    if (!profile.locality) {
      newErrors.locality = "Please select your district";
      valid = false;
    }
    if (!profile.category) {
      newErrors.category = "Please select your category";
      valid = false;
    }
    if (!profile.budget || profile.budget <= 0) {
      newErrors.budget = "Please enter a valid budget";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
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
            <Text style={s.title}>Tell us about yourself</Text>
            <Text style={s.progress}>Step 1 of 3</Text>

            <ProgressBar progress={0.33} />

            <Spacer size={10} />
            <Input
              placeholder="Full Name *"
              value={profile.fullName || ""}
              onChangeText={(v) => {
                updateProfile({ fullName: v });
                setErrors((prev) => ({ ...prev, fullName: "" }));
              }}
            />
            {errors.fullName ? (
              <Text style={s.errorText}>{errors.fullName}</Text>
            ) : null}
            <Spacer size={8} />

            <Accordion
              placeholder="Gender *"
              value={profile.gender || null}
              options={[...GENDERS]}
              onSelect={(v) => {
                updateProfile({ gender: v });
                setErrors((prev) => ({ ...prev, gender: "" }));
              }}
            />
            {errors.gender ? (
              <Text style={s.errorText}>{errors.gender}</Text>
            ) : null}

            <Accordion
              placeholder="Your District *"
              value={profile.locality || null}
              options={[...LOCALITIES]}
              onSelect={(v) => {
                updateProfile({ locality: v });
                setErrors((prev) => ({ ...prev, locality: "" }));
              }}
            />
            {errors.locality ? (
              <Text style={s.errorText}>{errors.locality}</Text>
            ) : null}

            <Accordion
              placeholder="Category *"
              value={profile.category || null}
              options={[...CATEGORIES]}
              onSelect={(v) => {
                updateProfile({ category: v });
                setErrors((prev) => ({ ...prev, category: "" }));
              }}
            />
            {errors.category ? (
              <Text style={s.errorText}>{errors.category}</Text>
            ) : null}

            <Spacer size={20} />

            <TouchableOpacity
              style={s.button}
              onPress={() => {
                if (validateStep1()) router.push("/(auth)/profile-setup/step2");
              }}
            >
              <Text style={s.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.colors.primary,
      padding: 16,
      borderRadius: 10,
      marginTop: 20,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 18,
      color: theme.colors.text,
      fontWeight: "700",
    },
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
    errorText: {
      color: "#ef4444",
      fontSize: 13,
      marginTop: -8,
      marginBottom: 8,
    },
    hint: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    textInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: 10,
      padding: 14,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
    },
  });
