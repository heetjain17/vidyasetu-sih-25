import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLanguageStore } from "../store/languageStore";
import { supportedLanguages, SupportedLanguage } from "../i18n/resources";
import { useTranslation } from "react-i18next";

const LANGUAGE_NAMES: Record<
  SupportedLanguage,
  { native: string; english: string }
> = {
  en: { native: "English", english: "English" },
  hi: { native: "हिंदी", english: "Hindi" },
  ks: { native: "کٲشُر", english: "Kashmiri" },
  doi: { native: "डोगरी", english: "Dogri" },
};

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isChanging } = useLanguageStore();

  const handleLanguageChange = async (language: SupportedLanguage) => {
    if (language !== currentLanguage && !isChanging) {
      await changeLanguage(language);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Language / भाषा</Text>

      <View style={styles.languageList}>
        {supportedLanguages.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.languageItem,
              currentLanguage === lang && styles.languageItemActive,
            ]}
            onPress={() => handleLanguageChange(lang)}
            disabled={isChanging}
          >
            <View style={styles.languageContent}>
              <Text
                style={[
                  styles.languageNative,
                  currentLanguage === lang && styles.textActive,
                ]}
              >
                {LANGUAGE_NAMES[lang].native}
              </Text>
              <Text
                style={[
                  styles.languageEnglish,
                  currentLanguage === lang && styles.textActive,
                ]}
              >
                {LANGUAGE_NAMES[lang].english}
              </Text>
            </View>

            {currentLanguage === lang && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  languageList: {
    gap: 12,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  languageItemActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  languageContent: {
    flex: 1,
  },
  languageNative: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  languageEnglish: {
    fontSize: 14,
    color: "#666",
  },
  textActive: {
    color: "#2196f3",
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2196f3",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
