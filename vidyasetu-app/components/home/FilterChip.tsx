import { Text, TouchableOpacity, StyleSheet } from "react-native";

export default function FilterChip({ label }: any) {
  return (
    <TouchableOpacity style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#E5F0FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: "auto",
  },
  text: { color: "#2A72DE", fontWeight: "600" },
});
