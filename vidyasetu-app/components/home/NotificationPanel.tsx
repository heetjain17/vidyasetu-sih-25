import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "../../constants/theme";

export default function NotificationPanel({ visible, onClose }: any) {
  const theme = useTheme();
  if (!visible) return null;

  return (
    <>
      {/* OVERLAY TO CLOSE PANEL */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* PANEL */}
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Notifications
        </Text>

        <View style={styles.item}>
          <View style={styles.unreadDot} />
          <Text style={[styles.text, { color: theme.colors.text }]}>
            Your aptitude report is ready!
          </Text>
        </View>

        <View style={styles.item}>
          <View style={[styles.unreadDot, { opacity: 0 }]} />
          <Text style={[styles.text, { color: theme.colors.text }]}>
            New career clusters added!
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  container: {
    position: "absolute",
    right: 10,
    top: 80,

    width: 260,
    padding: 14,
    borderRadius: 12,

    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 20,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  item: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: "red",
    borderRadius: 4,
    marginRight: 10,
  },
  text: { fontSize: 14 },
});
