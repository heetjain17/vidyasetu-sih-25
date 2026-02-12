import { View, StyleSheet } from "react-native";
import { useTheme } from "../constants/theme";

type Props = {
  progress: number; // value between 0 and 1
};

export default function ProgressBar({ progress }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.secondary + "33" },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            width: `${progress * 100}%`,
            backgroundColor: theme.colors.secondary,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 10,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  bar: {
    height: "100%",
    borderRadius: 10,
  },
});
