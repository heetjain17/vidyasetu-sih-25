import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

export default function LanguageTestScreen() {
  const { t } = useTranslation(["common", "navigation", "career", "errors"]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("app.name")}</Text>
        <Text style={styles.tagline}>{t("app.tagline")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language Switcher</Text>
        <LanguageSwitcher />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Translations</Text>
        <DemoItem label="Welcome" value={t("common.welcome")} />
        <DemoItem label="Hello" value={t("common.hello")} />
        <DemoItem label="Thank You" value={t("common.thankyou")} />
        <DemoItem label="Loading" value={t("common.loading")} />
        <DemoItem label="Error" value={t("common.error")} />
        <DemoItem label="Success" value={t("common.success")} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <DemoItem label="Continue" value={t("actions.continue")} />
        <DemoItem label="Cancel" value={t("actions.cancel")} />
        <DemoItem label="Save" value={t("actions.save")} />
        <DemoItem label="Get Started" value={t("actions.getStarted")} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        <DemoItem
          label="Home Tab"
          value={t("tabs.home", { ns: "navigation" })}
        />
        <DemoItem
          label="Explore Tab"
          value={t("tabs.explore", { ns: "navigation" })}
        />
        <DemoItem
          label="Assessment Tab"
          value={t("tabs.assessment", { ns: "navigation" })}
        />
        <DemoItem
          label="Career Details"
          value={t("screens.careerDetails", { ns: "navigation" })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Career</Text>
        <DemoItem
          label="Search Placeholder"
          value={t("search.placeholder", { ns: "career" })}
        />
        <DemoItem
          label="Top Match"
          value={t("recommendations.topMatch", { ns: "career" })}
        />
        <DemoItem
          label="View Details"
          value={t("card.viewDetails", { ns: "career" })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interpolation Example</Text>
        <DemoItem
          label="Match Percentage"
          value={t("card.match", { ns: "career", percent: 85 })}
        />
        <DemoItem
          label="Search Results (1)"
          value={t("search.results", { ns: "career", count: 1 })}
        />
        <DemoItem
          label="Search Results (5)"
          value={t("search.results", { ns: "career", count: 5 })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Errors</Text>
        <DemoItem
          label="No Connection"
          value={t("network.noConnection", { ns: "errors" })}
        />
        <DemoItem
          label="Required Field"
          value={t("validation.required", { ns: "errors" })}
        />
        <DemoItem
          label="Invalid Email"
          value={t("validation.invalidEmail", { ns: "errors" })}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function DemoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.demoItem}>
      <Text style={styles.demoLabel}>{label}:</Text>
      <Text style={styles.demoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 24,
    backgroundColor: "#2196f3",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#e3f2fd",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  demoItem: {
    paddingVertical: 8,
  },
  demoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  demoValue: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
});
