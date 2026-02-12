import React, { use } from "react";
import Svg, { Rect, Defs, Pattern, Circle } from "react-native-svg";
import { Dimensions, StyleSheet } from "react-native";
import { useTheme } from "@/constants/theme";

interface GridBackgroundProps {
  type?: "lines" | "dots";
  size?: number;
  color?: string;
  opacity?: number;
  strokeWidth?: number; // For lines
  dotRadius?: number; // For dots
}

export default function GridBackground({
  type = "lines", // Default to lines, matching your original
  size = 50,
  color = "#1282A2", // Color from your original file
  opacity = 0.05, // Made opacity a prop and more subtle
  strokeWidth = 1,
  dotRadius = 4,
}: GridBackgroundProps) {
  const theme = useTheme();
  return (
    <Svg style={StyleSheet.absoluteFillObject} preserveAspectRatio="none">
      <Defs>
        <Pattern
          id="grid"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          {type === "lines" ? (
            // Grid lines
            <Rect
              x="0"
              y="0"
              width={size}
              height={size}
              fill="none"
              stroke={color}
              strokeOpacity={opacity}
              strokeWidth={strokeWidth}
            />
          ) : (
            // Dot grid
            <Circle
              cx={size / 2} // Dot in the middle
              cy={size / 2}
              r={dotRadius}
              fill={color}
              fillOpacity={opacity}
            />
          )}
        </Pattern>
      </Defs>

      {/* Apply pattern */}
      <Rect width="100%" height="100%" fill={theme.colors.background} />
      <Rect width="100%" height="100%" fill="url(#grid)" />
    </Svg>
  );
}
