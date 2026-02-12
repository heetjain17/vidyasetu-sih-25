import { useTheme } from "@/constants/theme";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function RecommendationCard({
  // icon,
  label,
  color,
}: any) {
  const theme = useTheme();
  const s = styles(theme);
  return (
    <TouchableOpacity style={s.container}>
      <View style={[s.iconBox, { backgroundColor: color }]}>
        {/* <Image
          source={icon}
          style={{ width: 30, height: 30, tintColor: "white" }}
        /> */}
      </View>
      <Text style={s.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { alignItems: "center", width: 90 },
    iconBox: {
      width: 70,
      height: 70,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    label: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
  });
