import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { Languages } from "lucide-react-native";
import { useState } from "react";
import { useLanguageStore } from "../store/languageStore";
import { supportedLanguages, SupportedLanguage } from "../i18n/resources";
import { useTheme } from "../constants/theme";

const LANGUAGE_NAMES: Record<
  SupportedLanguage,
  { native: string; flag: string }
> = {
  en: { native: "English", flag: "🇬🇧" },
  hi: { native: "हिंदी", flag: "🇮🇳" },
  ks: { native: "کٲشُر", flag: "🏔️" },
  doi: { native: "डोगरी", flag: "🏔️" },
};

export function LanguageIconButton() {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const { currentLanguage, changeLanguage, isChanging } = useLanguageStore();

  const handleLanguageChange = async (language: SupportedLanguage) => {
    if (language !== currentLanguage && !isChanging) {
      await changeLanguage(language);
      setShowModal(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShowModal(true)}>
        <Languages size={26} color={theme.colors.text} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.container },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Language
            </Text>

            <View style={styles.languageList}>
              {supportedLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageItem,
                    { backgroundColor: theme.colors.inputBackground },
                    currentLanguage === lang && styles.languageItemActive,
                  ]}
                  onPress={() => handleLanguageChange(lang)}
                  disabled={isChanging}
                >
                  <Text style={styles.flag}>{LANGUAGE_NAMES[lang].flag}</Text>
                  <Text
                    style={[
                      styles.languageText,
                      { color: theme.colors.text },
                      currentLanguage === lang && styles.languageTextActive,
                    ]}
                  >
                    {LANGUAGE_NAMES[lang].native}
                  </Text>
                  {currentLanguage === lang && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.secondary },
              ]}
              onPress={() => setShowModal(false)}
            >
              <Text
                style={[
                  styles.closeButtonText,
                  { color: theme.colors.background },
                ]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  languageList: {
    gap: 12,
    marginBottom: 20,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  languageItemActive: {
    borderColor: "#2196f3",
  },
  flag: {
    fontSize: 28,
  },
  languageText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  languageTextActive: {
    color: "#2196f3",
  },
  checkmark: {
    fontSize: 20,
    color: "#2196f3",
    fontWeight: "bold",
  },
  closeButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
