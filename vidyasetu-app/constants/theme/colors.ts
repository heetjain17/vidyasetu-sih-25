/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const lightColors = {
  background: "#FAF8F1",
  surface: "#F7F7F7",
  text: "#034078",
  textSecondary: "#888888ff",
  primary: "#FFC700",
  secondary: "#1282A2",
  accent: "#F59E0B",
  border: "#E5E7EB",
  card: "#FFFFFF",
  error: "#EF4444",
  inputBackground: "#ffffff",
  container: "#EFF2F6",
  search: "#F2F2F2",
};

const darkColors = {
  background: "#0a0a0a",
  surface: "#141414",
  text: "#f5f5f5",
  textSecondary: "#a8a8a8",
  primary: "#ff9d5c",
  secondary: "#5ce1e6",
  accent: "#ff6b6b",
  border: "#2a2a2a",
  container: "#1a1a1a",
  search: "#1f1f1f",

  card: "#0f0f0f",
  error: "#F87171",
  inputBackground: "#1f1f1fff",
};

// Added semantic color names for better maintainability
const semanticColors = {
  success: "#22C55E", // Green
  warning: "#FACC15", // Yellow
  info: "#3B82F6", // Blue
};

export const Colors = {
  light: { ...lightColors, ...semanticColors },
  dark: { ...darkColors, ...semanticColors },
};
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
