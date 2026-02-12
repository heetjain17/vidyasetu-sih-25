import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/constants/theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton loading component with shimmer animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * Skeleton card for career/college cards
 */
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const theme = useTheme();
  const s = skeletonCardStyles(theme);

  return (
    <View style={[s.card, style]}>
      <View style={s.header}>
        <Skeleton width={40} height={40} borderRadius={10} />
      </View>
      <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={12} style={{ marginBottom: 6 }} />
      <Skeleton width="40%" height={12} />
    </View>
  );
};

/**
 * Skeleton for quick link items
 */
export const SkeletonQuickLink: React.FC = () => {
  const theme = useTheme();
  const s = skeletonQuickLinkStyles(theme);

  return (
    <View style={s.container}>
      <Skeleton width={40} height={40} borderRadius={10} />
      <View style={s.info}>
        <Skeleton width={120} height={14} style={{ marginBottom: 6 }} />
        <Skeleton width={80} height={10} />
      </View>
      <Skeleton width={18} height={18} borderRadius={9} />
    </View>
  );
};

/**
 * Skeleton for roadmap cards (horizontal scroll)
 */
export const SkeletonRoadmapCard: React.FC = () => {
  const theme = useTheme();
  const s = skeletonRoadmapStyles(theme);

  return (
    <View style={s.card}>
      <Skeleton
        width={44}
        height={44}
        borderRadius={12}
        style={{ marginBottom: 10 }}
      />
      <Skeleton width={80} height={14} style={{ marginBottom: 6 }} />
      <Skeleton width={60} height={10} />
    </View>
  );
};

const skeletonCardStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      width: "47%",
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      marginBottom: 12,
    },
  });

const skeletonQuickLinkStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 14,
    },
    info: {
      flex: 1,
    },
  });

const skeletonRoadmapStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      width: 130,
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });
