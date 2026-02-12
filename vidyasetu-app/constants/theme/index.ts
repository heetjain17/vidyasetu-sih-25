import { Colors } from "./colors";
import { useColorScheme } from "react-native";

export const useTheme = () => {
  const scheme = useColorScheme(); // 'light' or 'dark'
  const colors = scheme === "dark" ? Colors.dark : Colors.light;

  return {
    colors,

    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },

    radius: {
      sm: 6,
      md: 12,
      lg: 20,
      round: 999,
    },

    font: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      title: 28,
      headline: 34,
    },

    shadow: {
      light: {
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      dark: {
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
      },
    },
  };
};
