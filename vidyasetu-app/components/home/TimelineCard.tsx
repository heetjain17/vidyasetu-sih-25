import { View, Text, StyleSheet } from "react-native";

export default function TimelineCard({ date, event, detail }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.event}>{event}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#DAECFF",
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 160,
  },
  date: { color: "#2A72DE", fontWeight: "700", fontSize: 16 },
  event: { fontSize: 14, fontWeight: "700", marginTop: 6 },
  detail: { fontSize: 12, marginTop: 4, color: "#555" },
});
